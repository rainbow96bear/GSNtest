// SPDX-License-Identifier:MIT
pragma solidity ^0.8.7;

import {ERC2771Recipient} from "@opengsn/contracts/src/ERC2771Recipient.sol";
import {IRubixEscrow} from "./IRubixEscrow.sol";
import {IERC20} from "./IERC20.sol";
import "hardhat/console.sol";

enum RubixTaskStatus {
    AVAILABLE, // when task is created and no worker is assigned
    READY, // when a worker is assigned to AVAILABLE task
    STARTED, // when a worker has started READY task
    COMPLETED, // when a worker has completed STARTED task
    REJECTED, // when a lead has rejected COMPLETED task
    APPROVED, // when a lead has approved COMPLETED task
    CANCELLED // when a lead has cancelled AVAILABLE, READY, STARTED, COMPLETED task
}

enum RubixProjectStatus {
    AVAILABLE, // when a project is created and no lead is assigned
    READY, // when a lead is assigned to AVAILABLE project
    STARTED, // when a lead has started READY project
    COMPLETED, // when a lead has completed STARTED project
    REJECTED, // when a lead has rejected STARTED project
    APPROVED // when a client has approved COMPLETED project
}

struct RubixTask {
    // Incremental id of a task [0, 65535]
    uint16 id;
    // Name of a task
    string name;
    // Total pay in USDC assigned to a task
    uint256 totalPay;
    // Remaining pay in USDC assigned to a task
    uint256 currentPay;
    // Address of worker assigned to a task
    address assignedTo;
    // Status of a task
    RubixTaskStatus status;
}

contract RubixProjectTEST is ERC2771Recipient {
    address private escrow_address;
    IRubixEscrow private escrow_contract;
    address private currency_address;
    IERC20 private currency_contract;

    // Name of a project
    string public name;

    // Description of a project
    string public description;

    // Address of a project owner (client)
    address public owner;

    // Address of a project lead
    address public lead;

    // Counter for task id [1, 65535]
    uint16 private counter;

    // Total budget in USDC assigned to the project
    uint256 public totalBudget;

    // Remaining budget in USDC assigned to the project available for tasks (subtract pay for a lead)
    uint256 public taskBudget;

    // Deadline of the project in UNIX timestamp
    uint256 public deadline;

    // IPFS url of logo of the project
    // uint128 public logo;

    // IPFS url of requirements document of the project
    // uint128 public requirements;

    // IPFS url of final outcome of the project (url, image, video, etc.)
    // uint128 public outcome;

    // List of tasks
    mapping(uint32 => RubixTask) public tasks;

    // List of reviewers
    // mapping(uint32 => address) public reviewers;

    // Status of a project
    RubixProjectStatus public status;

    /**
     * Project configurations
     */

    // Pay in USDC that a lead gets when the project is started
    uint256 public startLeaderPay;

    // Pay in USDC that a lead gets when the project is completed
    uint256 public completeLeaderPay;

    // Pay in USDC that a lead gets when the project is approved
    uint256 public approveLeaderPay;

    // Rate of pay in basis point that lead deducts from worker pay
    uint32 public leadPayRate;

    // Rate of pay in basis point that a worker gets when the worker starts a task
    uint32 public startPayRate;

    // Rate of pay in basis point that a worker gets when the worker completes a task
    uint32 public completePayRate;

    // Rate of pay in basis point that a worker gets when the lead approves a task
    uint32 public approvePayRate;

    // uint8 public numberOfReviewers;

    constructor(
        address _escrow_address,
        address forwarder,
        address _owner,
        uint256[] memory configs,
        uint256 _deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) {
        _setTrustedForwarder(forwarder);
        owner = _owner;
        totalBudget = configs[0];
        startLeaderPay = configs[1];
        completeLeaderPay = configs[2];
        approveLeaderPay = configs[3];
        taskBudget = totalBudget - startLeaderPay - completeLeaderPay - approveLeaderPay;
        deadline = _deadline;
        status = RubixProjectStatus.AVAILABLE;
        counter = 1;
        escrow_address = _escrow_address;
        escrow_contract = IRubixEscrow(_escrow_address);
        currency_address = escrow_contract.getCurrencyAddress();
        currency_contract = IERC20(currency_address);
        currency_contract.permit(_owner, escrow_address, totalBudget, deadline, v, r, s);
        escrow_contract.addFunds(_owner, totalBudget);
    }

    function calcPayByRate(uint256 budget, uint32 rate) internal pure returns (uint256) {
        return (budget * rate) / 10000;
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "Owner can call this function");
        _;
    }

    modifier onlyLeader() {
        require(_msgSender() == lead, "Leader can call this function");
        require(lead != address(0), "Leader is not set");
        _;
    }

    modifier onlyWorker(uint32 id) {
        require(tasks[id].assignedTo == _msgSender(), "Worker can call this function");
        _;
    }

    function hireLeader(address _lead) external onlyOwner {
        require(lead == address(0), "Leader is already assigned");
        require(status == RubixProjectStatus.AVAILABLE, "Project is not available");
        lead = _lead;
        status = RubixProjectStatus.READY;
    }

    function fireLeader() external onlyOwner {
        require(lead != address(0), "No leader to fire");
        require(
            status == RubixProjectStatus.AVAILABLE ||
                status == RubixProjectStatus.READY ||
                status == RubixProjectStatus.STARTED ||
                status == RubixProjectStatus.COMPLETED,
            "Task is in invalid state"
        );
        lead = address(0);

        // for (uint32 i = 0; i < counter; i++) {
        //     _cancelTask(i);
        // }

        status = RubixProjectStatus.AVAILABLE;
    }

    function startProject() external onlyLeader {
        require(status == RubixProjectStatus.READY, "Project is not ready");
        status = RubixProjectStatus.STARTED;
        currency_contract.transferFrom(escrow_address, lead, startLeaderPay);
    }

    function completeProject() external onlyLeader {
        require(status == RubixProjectStatus.STARTED, "Project is not started");
        status = RubixProjectStatus.COMPLETED;
        currency_contract.transferFrom(escrow_address, lead, completeLeaderPay);
    }

    function approveProject() external onlyOwner {
        require(status == RubixProjectStatus.COMPLETED, "Project is not completed");
        status = RubixProjectStatus.APPROVED;
        currency_contract.transferFrom(escrow_address, lead, approveLeaderPay);
    }

    function rejectProject() external onlyOwner {
        require(status == RubixProjectStatus.COMPLETED, "Project is not completed");
        status = RubixProjectStatus.REJECTED;
    }

    function addTask(string memory taskName, uint256 pay) external onlyLeader {
        require(taskBudget >= pay, "Not enough budget for tasks");
        RubixTask memory task = RubixTask(
            counter,
            taskName,
            pay,
            pay,
            address(0),
            RubixTaskStatus.AVAILABLE
        );
        taskBudget -= task.totalPay;
        tasks[counter] = task;
        counter++;
    }

    function assignTask(uint32 id, address worker) public onlyLeader {
        require(worker != address(0), "Invalid worker");
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status == RubixTaskStatus.AVAILABLE, "Task is not available");
        tasks[id].assignedTo = worker;
        tasks[id].status = RubixTaskStatus.READY;
    }

    function _cancelTask(uint32 id) internal onlyLeader{
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status != RubixTaskStatus.APPROVED, "Task is already approved");
        if (tasks[id].status != RubixTaskStatus.CANCELLED) {
            taskBudget += tasks[id].currentPay;
            tasks[id].status = RubixTaskStatus.CANCELLED;
        }
    }

    function cancelTask(uint32 id) external onlyLeader{
        _cancelTask(id);
    }

    function startTask(uint32 id) public  {
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status == RubixTaskStatus.READY, "Task is not ready");
        tasks[id].status = RubixTaskStatus.STARTED;
        uint256 workerPay = calcPayByRate(tasks[id].totalPay, startPayRate);
        uint256 leadPay = calcPayByRate(workerPay, leadPayRate);
        currency_contract.transferFrom(escrow_address, tasks[id].assignedTo, workerPay);
        currency_contract.transferFrom(escrow_address, lead, leadPay);
    }

    function completeTask(uint32 id) public onlyWorker(id) {
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status == RubixTaskStatus.STARTED, "Task is not started");
        tasks[id].status = RubixTaskStatus.COMPLETED;
        uint256 workerPay = calcPayByRate(tasks[id].totalPay, completePayRate);
        uint256 leadPay = calcPayByRate(workerPay, leadPayRate);
        currency_contract.transferFrom(escrow_address, tasks[id].assignedTo, workerPay);
        currency_contract.transferFrom(escrow_address, lead, leadPay);
    }

    function approveTask(uint32 id) public onlyLeader {
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status == RubixTaskStatus.COMPLETED, "Task is not completed");
        tasks[id].status = RubixTaskStatus.APPROVED;
        uint256 workerPay = calcPayByRate(tasks[id].totalPay, approvePayRate);
        uint256 leadPay = calcPayByRate(workerPay, leadPayRate);
        currency_contract.transferFrom(escrow_address, tasks[id].assignedTo, workerPay);
        currency_contract.transferFrom(escrow_address, lead, leadPay);
    }

    function rejectTask(uint32 id) public onlyLeader {
        require(tasks[id].id > 0, "Task does not exist");
        require(tasks[id].status == RubixTaskStatus.COMPLETED, "Task is not completed");
        tasks[id].status = RubixTaskStatus.REJECTED;
    }
}
