# OpenGSN 설명

## 기술 설명
사용자의 Gas 비용에 대한 부담을 줄이기 위하여 Gas비용을 대신 지불 혹은 Token으로 대체할 수 있는 Smart Contract 기능

## 용어 설명
**Relay Server :** <br>
사용자의 트랜잭션을 수신하고 해당 트랜잭션을 중개하여 네트워크 상에서 실행될 수 있도록 도와주는 노드

**Paymaster :** <br>
GSN에서 사용되는 핵심 스마트 컨트랙트로 사용자가 GSN을 통해 스마트 컨트랙트 트랜잭션을 실행할 때 Relay Server에게 지불되는 gas 비용을 관리하고 조정하는 역할

**Paymaster 종류**
<div>
  
  AcceptEverything : Target contract가 BasePaymaster 만 상속
  https://github.com/opengsn/gsn/blob/master/packages/paymasters/contracts/AcceptEverythingPaymaster.sol
  
  Whitelist : _preRelayedCall에서 whitelist address 검증
  https://github.com/opengsn/gsn/blob/master/packages/paymasters/contracts/WhitelistPaymaster.sol
  
  permitERC20 : Gas비용을 계산하여 gas비용만큼을 사용자에게 ERC20토큰을 지불하도록 하는 코드
  https://github.com/opengsn/gsn/blob/19ca9a91255986cf45d330f8b1c313c8d4ebd020/packages/paymasters/contracts/PermitERC20UniswapV3Paymaster.sol
  
  Single : setTarget을 통하여 특정 contract를 이용할 때만 paymaster에서 비용 지불하도록 지정
  https://github.com/opengsn/gsn/blob/19ca9a91255986cf45d330f8b1c313c8d4ebd020/packages/paymasters/contracts/SingleRecipientPaymaster.sol
  
</div>


**Relay Hub :** <br>
GSN에서 사용되는 핵심 스마트 컨트랙트로 Relay Server, Paymaster 및 사용자 간의 상호 작용을 관리하고 GSN의 핵심 기능을 제공합니다. 사용자와 스마트 계약 사이의 중개 역할

## Document Link
https://docs.opengsn.org/

## Flow Chart
<div align="center">
  
  ![image](https://github.com/rainbow96bear/GSNtest/assets/113357212/9b9176c0-d337-4905-aa70-04ca2f867137)
</div>

## OpenGSN의 sample App 분석
https://docs.google.com/document/d/14zJod-uZabjrafOfUw7-bFMJjbR_MOh6iuCHi-jkwcU/edit#heading=h.yq8uce944xch

## TestCase
<ol style="list-style-type: decimal;" data-ke-list-type="decimal">
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">클라이언트가 프로젝트를 생성한다 (프로젝트 컨트랙트 디플로이) <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">Budget이 최소 Budget보다 적으면 fail</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">***rate 들은 0~10000사이의 숫자가 아니면 fail</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">deadline은 오늘보다 이후여야 한다.</span></li>
    </ol>
  </li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">클라이언트가 리더를 고용한다 <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">이미 고용되어있으면 fail</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">클라이언트가 리더를 해고한다 <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">해고할 리더가 없으면 fail</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 프로젝트를 시작한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 프로젝트를 완료한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">클라이언트가 프로젝트를 승인한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">클라이언트가 프로젝트를 거절한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">리더가 태스크를 추가한다 <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">pay가 프로젝트의 남은 budget이하라면 fail</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 태스크에 작업자를 할당한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 태스크를 취소한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">작업자가 태스크를 시작한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">작업자가 태스크를 완료한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 태스크를 승인한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;">리더가 태스크를 거절한다</span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">작업자 페이먼트 validation <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">작업자가 태스크를 시작하면 태스크의 pay의 X%만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">작업자가 태스크를 완료하면 태스크의 pay의 Y%만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">리더가 태스크를 승인하면 태스크의 pay의 Z%만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">X + Y + Z = 프로젝트 생성시 설정값 = 100%</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">리더 페이먼트 validation <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">리더는 작업자가 pay를 받을때 마다 작업자가 받는 pay의 A%만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">작업자가 태스크를 시작하면 태스크의 pay의 X만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">작업자가 태스크를 완료하면 태스크의 pay의 Y만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">리더가 태스크를 승인하면 태스크의 pay의 Z만큼 지급됨</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">X + Y + Z = 프로젝트 생성시 설정값 = 총 Budget보다 적어야함</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">여러가지 상태 전환 validation <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">예를들면 이미 시작한 태스크를 다시 시작할 수 없다</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">이미 시작한 프로젝트를 다시 시작할 수 없다</span></li>
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">이미 완료된 태스크를 취소할 수 없다 등등</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">권한 validation <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">각 액션마다 클라이언트, 리더, 작업자 등 실행할 수 있는 사람들이 따로 있어서 다른 사람이 실행하고자 하면 fail되어야 한다</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
  
  <br>
  
  <li style="list-style-type: decimal; color: #000000;"><span style="color: #000000;"><span style="color: #000000;">Double payment 테스트 <b></b></span></span>
    <ol style="list-style-type: decimal;" data-ke-list-type="decimal">
      <li style="list-style-type: lower-alpha; color: #000000;"><span style="color: #000000;">여러가지 상태전환을 통해서 시작한 태스크를 다시 시작한다거나 했을 시 double payment가 일어나지 않아야 한다.</span></li>
    </ol>
  <span style="color: #000000;"><b></b> </span></li>
</ol>
