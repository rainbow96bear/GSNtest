import { ethers } from "hardhat";
import chai, { expect, assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Contract, ContractFactory } from "ethers";

chai.use(chaiAsPromised);
describe("Rubix Project contract  test", async function () {
  let rubixEscrow: Contract;
  let RubixProject: ContractFactory;
  let signer: any;
  let sig: any;
  const forwarder = "0xB2b5841DBeF766d4b521221732F9B618fCf34A87";
  const deadline = Date.now() + 1000 * 60 * 60;
  const budget = ethers.BigNumber.from("100").mul(
    ethers.BigNumber.from("10").pow(6)
  );
  beforeEach(async () => {
    const SampleToken = await ethers.getContractFactory("SampleToken");
    const sampleToken = await SampleToken.deploy();
    await sampleToken.deployed();

    const RubixEscrow = await ethers.getContractFactory("RubixEscrow");
    rubixEscrow = await RubixEscrow.deploy(sampleToken.address);
    await rubixEscrow.deployed();

    RubixProject = await ethers.getContractFactory("RubixProjectTEST");

    signer = (await ethers.getSigners())[0];

    // 서명 얻기
    const signature = await signer._signTypedData(
      {
        name: "SampleToken",
        version: "1",
        chainId: 31337,
        verifyingContract: sampleToken.address,
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer.address,
        spender: rubixEscrow.address,
        value: budget,
        nonce: 0,
        deadline,
      }
    );
    sig = ethers.utils.splitSignature(signature);
  });
  describe("deploy test", async function () {
    it("perfect", async function () {
      await expect(
        RubixProject.deploy(
          rubixEscrow.address,
          forwarder,
          signer.address,
          [budget, 100, 10, 1],
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).to.be.fulfilled;
    });
    it("budget : 100000", async function () {
      await expect(
        RubixProject.deploy(
          rubixEscrow.address,
          forwarder,
          signer.address,
          [100000, 100, 10, 1],
          deadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).to.be.rejectedWith(
        "cannot estimate gas; transaction may fail or may require manual gas limit"
      );
    });
    it("deadline : Date.now() - 1", async function () {
      await expect(
        RubixProject.deploy(
          rubixEscrow.address,
          forwarder,
          signer.address,
          [budget, 100, 10, 1],
          Date.now() - 1,
          sig.v,
          sig.r,
          sig.s
        )
      ).to.be.rejectedWith(
        "cannot estimate gas; transaction may fail or may require manual gas limit"
      );
    });
    it("check Rate", async function () {
      const project = await RubixProject.deploy(
        rubixEscrow.address,
        forwarder,
        signer.address,
        [budget, 100, 10, 1],
        deadline,
        sig.v,
        sig.r,
        sig.s
      );
      const leadPayRate = await project.leadPayRate();
      const startPayRate = await project.startPayRate();
      const completePayRate = await project.completePayRate();
      const approvePayRate = await project.approvePayRate();

      expect(leadPayRate >= 0 && leadPayRate <= 10000).to.equal(true);
      expect(startPayRate >= 0 && startPayRate <= 10000).to.equal(true);
      expect(completePayRate >= 0 && completePayRate <= 10000).to.equal(true);
      expect(approvePayRate >= 0 && approvePayRate <= 10000).to.equal(true);
    });
  });
  describe("function test", async () => {
    let rubixProject: Contract;
    let owner: any;
    let leader: any;
    let worker: any;
    beforeEach(async () => {
      const signerArr = await ethers.getSigners();
      owner = signerArr[0];
      leader = signerArr[1];
      worker = signerArr[2];
      const RubixProject = await ethers.getContractFactory("RubixProjectTEST");
      rubixProject = await RubixProject.deploy(
        rubixEscrow.address,
        forwarder,
        signer.address,
        [budget, 100, 10, 1],
        deadline,
        sig.v,
        sig.r,
        sig.s
      );
    });
    describe("hire & fire", async function () {
      it("hireLeader", async function () {
        await expect(rubixProject.connect(owner).hireLeader(leader.address)).to
          .be.fulfilled;
      });
      it("prevent hireLeader repeat", async function () {
        await expect(rubixProject.connect(owner).hireLeader(leader.address)).to
          .be.fulfilled;
        await expect(
          rubixProject.connect(owner).hireLeader(leader.address)
        ).to.be.rejectedWith("Leader is already assigned");
      });
      it("fireLeader", async function () {
        // fireLeader의 _cancelTask에 onlyLeader로 오류 발생
        await expect(
          rubixProject.connect(owner).fireLeader()
        ).to.be.rejectedWith("No leader to fire");

        await rubixProject.connect(owner).hireLeader(leader.address);

        // leader hire만 하였을 경우 taska[0].id은 초기 값0
        // _cancelTask에서 require(tasks[id].id > 0, "Task does not exist");
        // hire 후 아무 작업 없이 fire 시 오류 발생
        await expect(rubixProject.connect(owner).fireLeader()).to.be.fulfilled;
      });
      it("prevent fireLeader without leader", async function () {
        // fireLeader의 _cancelTask에 onlyLeader로 오류 발생
        await expect(
          rubixProject.connect(owner).fireLeader()
        ).to.be.rejectedWith("No leader to fire");
      });
    });
    describe("about project", async () => {
      beforeEach(async function () {
        await rubixProject.connect(owner).hireLeader(leader.address);
      });
      it("prevent start by another", async function () {
        await expect(rubixProject.connect(owner).startProject()).to.be.rejected;
        await expect(rubixProject.connect(worker).startProject()).to.be
          .rejected;
      });
      it("prevent start repeat", async function () {
        await expect(rubixProject.connect(leader).startProject()).to.be
          .fulfilled;
        await expect(rubixProject.connect(leader).startProject()).to.be
          .rejected;
      });
      it("start & complete", async function () {
        await expect(rubixProject.connect(leader).startProject()).to.be
          .fulfilled;
        await expect(rubixProject.connect(leader).completeProject()).to.be
          .fulfilled;
      });
      describe("approve & reject", async () => {
        beforeEach(async function () {
          await rubixProject.connect(leader).startProject();
          await rubixProject.connect(leader).completeProject();
        });
        it("approve Project", async function () {
          await expect(rubixProject.connect(owner).approveProject()).to.be
            .fulfilled;
        });
        it("reject Project", async function () {
          await expect(rubixProject.connect(owner).rejectProject()).to.be
            .fulfilled;
        });
      });
      it("Not enough budet case", async function () {
        await expect(
          rubixProject.connect(leader).addTask("test Task3", 10000000000000)
        ).to.rejectedWith("Not enough budget for tasks");
      });
      it("add, assign, cancle Task", async function () {
        await expect(rubixProject.connect(leader).addTask("test Task1", 100)).to
          .be.fulfilled;
        await expect(rubixProject.connect(leader).addTask("test Task2", 100)).to
          .be.fulfilled;

        // id가 0인 경우 assignTask 불가
        await expect(rubixProject.connect(leader).assignTask(1, worker.address))
          .to.be.fulfilled;

        // id가 0인 경우 cancelTask 불가
        await expect(rubixProject.connect(leader).cancelTask(1)).to.be
          .fulfilled;
      });
      describe("about Task", async () => {
        beforeEach(async function () {
          await rubixProject.connect(leader).addTask("test Task1", 100);
          await rubixProject.connect(leader).addTask("test Task2", 100);
          await rubixProject.connect(leader).assignTask(1, worker.address);
        });
        it("prevent start by another", async function () {
          // 오류가 나는 이유를 모르겠습니다..
          await expect(rubixProject.connect(owner).startTask(1)).to.be.rejected;
          await expect(rubixProject.connect(leader).startTask(1)).to.be
            .rejected;
        });
        it("prevent start repeat", async function () {
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .rejected;
        });
        it("start & complete Task", async function () {
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).completeTask(1)).to.be
            .fulfilled;
        });
        it("prevent complete repeat", async function () {
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).completeTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).completeTask(1)).to.be
            .rejected;
        });
        it("prevent completed task restart", async function () {
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).completeTask(1)).to.be
            .fulfilled;
          await expect(rubixProject.connect(worker).startTask(1)).to.be
            .rejected;
        });
        it("approve", async function () {
          await rubixProject.connect(worker).startTask(1);
          await rubixProject.connect(worker).completeTask(1);
          await expect(rubixProject.connect(leader).approveTask(1)).to.be
            .fulfilled;
        });
        it("reject", async function () {
          await rubixProject.connect(worker).startTask(1);
          await rubixProject.connect(worker).completeTask(1);
          await expect(rubixProject.connect(leader).rejectTask(1)).to.be
            .fulfilled;
        });
        it("payment validation", async function () {
          const totalBudget = await rubixProject.totalBudget();
          const totalPay = (await rubixProject.tasks(1)).totalPay;

          await rubixProject.connect(worker).startTask(1);
          const currentPay_start = (await rubixProject.tasks(1)).currentPay;

          await rubixProject.connect(worker).completeTask(1);
          const currentPay_complete = (await rubixProject.tasks(1)).currentPay;

          await rubixProject.connect(leader).approveTask(1);
          const currentPay_approve = (await rubixProject.tasks(1)).currentPay;

          // rate가 0으로 설정되어 있어 지불이 안 되는 것 같습니다.
          console.log("totalBudget : ", totalBudget);
          console.log("total : ", totalPay);
          console.log("currentPay_start : ", currentPay_start);
          console.log("currentPay_complete : ", currentPay_complete);
          console.log("currentPay_approve : ", currentPay_approve);
        });
      });
    });
  });
});
