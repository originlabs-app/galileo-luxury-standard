// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {Test} from "forge-std/Test.sol";
import {GalileoAccessControl} from "../../src/infrastructure/GalileoAccessControl.sol";
import {IGalileoAccessControl} from "../../src/interfaces/infrastructure/IAccessControl.sol";
import {IIdentityRegistry} from "@erc3643org/erc-3643/contracts/registry/interface/IIdentityRegistry.sol";
import {IIdentity} from "@onchain-id/solidity/contracts/interface/IIdentity.sol";
import {IERC735} from "@onchain-id/solidity/contracts/interface/IERC735.sol";
import {IClaimIssuer} from "@onchain-id/solidity/contracts/interface/IClaimIssuer.sol";

contract GalileoAccessControlTest is Test {
    // Mirror IGalileoAccessControl events (Solidity 0.8.17 cannot emit interface-qualified events)
    event IdentityRegistrySet(address indexed oldRegistry, address indexed newRegistry);
    event RoleClaimRequirementSet(bytes32 indexed role, uint256 indexed claimTopic, uint256 previousClaimTopic);
    event RoleGrantedWithIdentity(bytes32 indexed role, address indexed account, address indexed identityAddress, uint256 claimTopic, address sender);
    event RoleSuspended(bytes32 indexed role, address indexed account, string reason, address suspendedBy);
    event RoleReinstated(bytes32 indexed role, address indexed account, address reinstatedBy);
    event EmergencyAccessGranted(bytes32 indexed role, address indexed account, uint256 duration, uint256 expiresAt, string reason);
    event RoleGrantRequestCancelled(bytes32 indexed role, address indexed account, address cancelledBy);

    GalileoAccessControl internal ac;

    address internal admin   = address(0xA001);
    address internal alice   = address(0xA002);
    address internal bob     = address(0xA003);
    address internal charlie = address(0xA004);

    // Mock addresses for identity infrastructure
    address internal mockRegistry = address(0xB001);
    address internal mockIdentity = address(0xB002);
    address internal mockIssuer  = address(0xB003);

    uint256 internal constant KYB_TOPIC = uint256(keccak256("galileo.kyb.verified"));
    uint256 internal constant SERVICE_TOPIC = uint256(keccak256("galileo.service_center"));
    bytes32 internal constant MOCK_CLAIM_ID = keccak256("mock_claim_id");
    bytes  internal constant MOCK_SIG  = abi.encodePacked("sig");
    bytes  internal constant MOCK_DATA = abi.encodePacked("data");

    // Cached role constants — avoids external calls to ac.ROLE() that consume vm.prank
    bytes32 internal BRAND_ADMIN;
    bytes32 internal OPERATOR;
    bytes32 internal AUDITOR;
    bytes32 internal REGULATOR;
    bytes32 internal SERVICE_CENTER_ADMIN;
    bytes32 internal DEFAULT_ADMIN;

    // ─────────────────────────────────────────────────────────────────
    // Setup
    // ─────────────────────────────────────────────────────────────────

    function setUp() public {
        vm.prank(admin);
        ac = new GalileoAccessControl(admin);

        // Cache role constants to avoid external calls in test bodies
        BRAND_ADMIN = ac.BRAND_ADMIN_ROLE();
        OPERATOR = ac.OPERATOR_ROLE();
        AUDITOR = ac.AUDITOR_ROLE();
        REGULATOR = ac.REGULATOR_ROLE();
        SERVICE_CENTER_ADMIN = ac.SERVICE_CENTER_ADMIN_ROLE();
        DEFAULT_ADMIN = ac.DEFAULT_ADMIN_ROLE();
    }

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    function test_constructor_grantsDefaultAdminToAdmin() public view {
        assertTrue(ac.hasRole(DEFAULT_ADMIN, admin));
    }

    function test_constructor_rejectsZeroAdmin() public {
        vm.expectRevert("GalileoAccessControl: zero admin");
        new GalileoAccessControl(address(0));
    }

    // ─────────────────────────────────────────────────────────────────
    // Role constants
    // ─────────────────────────────────────────────────────────────────

    function test_roleConstants_returnCorrectValues() public view {
        assertEq(BRAND_ADMIN,        keccak256("BRAND_ADMIN_ROLE"));
        assertEq(OPERATOR,           keccak256("OPERATOR_ROLE"));
        assertEq(AUDITOR,            keccak256("AUDITOR_ROLE"));
        assertEq(REGULATOR,          keccak256("REGULATOR_ROLE"));
        assertEq(SERVICE_CENTER_ADMIN, keccak256("SERVICE_CENTER_ADMIN_ROLE"));
    }

    function test_roleConstants_areDistinct() public view {
        bytes32[5] memory roles = [
            BRAND_ADMIN,
            OPERATOR,
            AUDITOR,
            REGULATOR,
            SERVICE_CENTER_ADMIN
        ];
        for (uint256 i = 0; i < roles.length; i++) {
            for (uint256 j = i + 1; j < roles.length; j++) {
                assertTrue(roles[i] != roles[j], "duplicate role");
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Identity registry management
    // ─────────────────────────────────────────────────────────────────

    function test_setIdentityRegistry_succeeds() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IdentityRegistrySet(address(0), mockRegistry);
        ac.setIdentityRegistry(mockRegistry);
        assertEq(ac.getIdentityRegistry(), mockRegistry);
    }

    function test_setIdentityRegistry_rejectsZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: zero address");
        ac.setIdentityRegistry(address(0));
    }

    function test_setIdentityRegistry_onlyAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        ac.setIdentityRegistry(mockRegistry);
    }

    function test_setIdentityRegistry_emitsOldAddress() public {
        vm.prank(admin);
        ac.setIdentityRegistry(mockRegistry);
        address newReg = address(0xB999);

        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit IdentityRegistrySet(mockRegistry, newReg);
        ac.setIdentityRegistry(newReg);
    }

    // ─────────────────────────────────────────────────────────────────
    // Claim requirement management
    // ─────────────────────────────────────────────────────────────────

    function test_setRoleClaimRequirement_succeeds() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit RoleClaimRequirementSet(BRAND_ADMIN, KYB_TOPIC, 0);
        ac.setRoleClaimRequirement(BRAND_ADMIN, KYB_TOPIC);
        assertEq(ac.getRoleClaimRequirement(BRAND_ADMIN), KYB_TOPIC);
    }

    function test_setRoleClaimRequirement_onlyAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        ac.setRoleClaimRequirement(BRAND_ADMIN, KYB_TOPIC);
    }

    function test_setRoleClaimRequirement_canClearRequirement() public {
        vm.prank(admin);
        ac.setRoleClaimRequirement(BRAND_ADMIN, KYB_TOPIC);

        vm.prank(admin);
        ac.setRoleClaimRequirement(BRAND_ADMIN, 0);
        assertEq(ac.getRoleClaimRequirement(BRAND_ADMIN), 0);
    }

    function test_getRoleClaimRequirement_defaultsToZero() public view {
        assertEq(ac.getRoleClaimRequirement(BRAND_ADMIN), 0);
    }

    // ─────────────────────────────────────────────────────────────────
    // Identity-aware role management
    // ─────────────────────────────────────────────────────────────────

    function _setupIdentityMocks(bool registered, bool identityMatches, bool claimValid) internal {
        vm.prank(admin);
        ac.setIdentityRegistry(mockRegistry);

        // mock: registry.contains(alice)
        vm.mockCall(
            mockRegistry,
            abi.encodeWithSelector(IIdentityRegistry.contains.selector, alice),
            abi.encode(registered)
        );

        if (registered) {
            // mock: registry.identity(alice)
            address retIdentity = identityMatches ? mockIdentity : address(0xDEAD);
            vm.mockCall(
                mockRegistry,
                abi.encodeWithSelector(IIdentityRegistry.identity.selector, alice),
                abi.encode(retIdentity)
            );
        }

        if (registered && identityMatches) {
            // mock: identity.getClaimIdsByTopic(topic)
            bytes32[] memory ids = claimValid ? _singletonArray(MOCK_CLAIM_ID) : new bytes32[](0);
            vm.mockCall(
                mockIdentity,
                abi.encodeWithSelector(IERC735.getClaimIdsByTopic.selector, KYB_TOPIC),
                abi.encode(ids)
            );

            if (claimValid) {
                // mock: identity.getClaim(claimId)
                vm.mockCall(
                    mockIdentity,
                    abi.encodeWithSelector(bytes4(keccak256("getClaim(bytes32)")), MOCK_CLAIM_ID),
                    abi.encode(KYB_TOPIC, uint256(1), mockIssuer, MOCK_SIG, MOCK_DATA, "")
                );
                // mock: issuer.isClaimValid(...)
                vm.mockCall(
                    mockIssuer,
                    abi.encodeWithSelector(IClaimIssuer.isClaimValid.selector),
                    abi.encode(true)
                );
            }
        }
    }

    function test_grantRoleWithIdentity_succeeds() public {
        _setupIdentityMocks(true, true, true);

        vm.prank(admin);
        vm.expectEmit(true, true, true, false);
        emit RoleGrantedWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC, admin);
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);

        assertTrue(ac.hasRole(BRAND_ADMIN, alice));
    }

    function test_grantRoleWithIdentity_revertsWhenRegistryNotSet() public {
        vm.prank(admin);
        vm.expectRevert(IGalileoAccessControl.IdentityRegistryNotSet.selector);
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
    }

    function test_grantRoleWithIdentity_revertsWhenNotRegistered() public {
        _setupIdentityMocks(false, false, false);

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(IGalileoAccessControl.IdentityNotVerified.selector, alice));
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
    }

    function test_grantRoleWithIdentity_revertsWhenIdentityMismatch() public {
        _setupIdentityMocks(true, false, false);

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(IGalileoAccessControl.ClaimNotValid.selector, alice, KYB_TOPIC));
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
    }

    function test_grantRoleWithIdentity_revertsWhenClaimInvalid() public {
        _setupIdentityMocks(true, true, false);

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(IGalileoAccessControl.ClaimNotValid.selector, alice, KYB_TOPIC));
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
    }

    function test_grantRoleWithIdentity_revertsWhenSuspended() public {
        _setupIdentityMocks(true, true, true);

        // First grant, then suspend
        vm.prank(admin);
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
        vm.prank(admin);
        ac.suspendRole(BRAND_ADMIN, alice, "investigation");

        // Attempt re-grant while suspended
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(IGalileoAccessControl.RoleIsSuspended.selector, BRAND_ADMIN, alice)
        );
        ac.grantRoleWithIdentity(BRAND_ADMIN, alice, mockIdentity, KYB_TOPIC);
    }

    function test_grantRoleWithIdentity_onlyRoleAdmin() public {
        _setupIdentityMocks(true, true, true);

        vm.prank(alice);
        vm.expectRevert();
        ac.grantRoleWithIdentity(BRAND_ADMIN, bob, mockIdentity, KYB_TOPIC);
    }

    function test_hasRoleWithIdentity_trueWhenNoClaimRequired() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        assertTrue(ac.hasRoleWithIdentity(OPERATOR, alice));
    }

    function test_hasRoleWithIdentity_trueWhenClaimValid() public {
        _setupIdentityMocks(true, true, true);

        vm.prank(admin);
        ac.setRoleClaimRequirement(BRAND_ADMIN, KYB_TOPIC);
        vm.prank(admin);
        ac.grantRole(BRAND_ADMIN, alice);

        assertTrue(ac.hasRoleWithIdentity(BRAND_ADMIN, alice));
    }

    function test_hasRoleWithIdentity_falseWhenRoleNotGranted() public view {
        assertFalse(ac.hasRoleWithIdentity(BRAND_ADMIN, alice));
    }

    function test_hasRoleWithIdentity_falseWhenRegistryNotSet() public {
        vm.prank(admin);
        ac.grantRole(BRAND_ADMIN, alice);
        vm.prank(admin);
        ac.setRoleClaimRequirement(BRAND_ADMIN, KYB_TOPIC);

        assertFalse(ac.hasRoleWithIdentity(BRAND_ADMIN, alice));
    }

    // ─────────────────────────────────────────────────────────────────
    // Two-phase role grants
    // ─────────────────────────────────────────────────────────────────

    function test_requestAndConfirmRoleGrant() public {
        uint256 delay = 2 days;
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, delay);

        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        (address reqBy, uint256 reqAt, uint256 canConfirm) = ac.getRoleGrantRequest(BRAND_ADMIN, alice);
        assertEq(reqBy, admin);
        assertEq(reqAt, block.timestamp);
        assertEq(canConfirm, block.timestamp + delay);

        vm.warp(block.timestamp + delay);

        vm.prank(admin);
        ac.confirmRoleGrant(BRAND_ADMIN, alice, address(0), 0);
        assertTrue(ac.hasRole(BRAND_ADMIN, alice));
    }

    function test_requestRoleGrant_revertsWithoutDelay() public {
        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: no delay configured for role");
        ac.requestRoleGrant(BRAND_ADMIN, alice);
    }

    function test_requestRoleGrant_revertsDuplicateRequest() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 1 days);

        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: pending request exists");
        ac.requestRoleGrant(BRAND_ADMIN, alice);
    }

    function test_confirmRoleGrant_revertsBeforeDelay() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 2 days);
        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        vm.warp(block.timestamp + 1 days);
        vm.prank(admin);
        vm.expectRevert(); // GrantDelayNotElapsed
        ac.confirmRoleGrant(BRAND_ADMIN, alice, address(0), 0);
    }

    function test_confirmRoleGrant_revertsWithNoRequest() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(IGalileoAccessControl.NoValidGrantRequest.selector, BRAND_ADMIN, alice)
        );
        ac.confirmRoleGrant(BRAND_ADMIN, alice, address(0), 0);
    }

    function test_cancelRoleGrantRequest_byRequester() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 1 days);
        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit RoleGrantRequestCancelled(BRAND_ADMIN, alice, admin);
        ac.cancelRoleGrantRequest(BRAND_ADMIN, alice);

        (address reqBy,,) = ac.getRoleGrantRequest(BRAND_ADMIN, alice);
        assertEq(reqBy, address(0));
    }

    function test_cancelRoleGrantRequest_revertsUnauthorized() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 1 days);
        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        vm.prank(alice);
        vm.expectRevert("GalileoAccessControl: not authorized to cancel");
        ac.cancelRoleGrantRequest(BRAND_ADMIN, alice);
    }

    function test_cancelRoleGrantRequest_byDefaultAdmin() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 1 days);
        vm.prank(admin);
        ac.requestRoleGrant(BRAND_ADMIN, alice);

        // admin (DEFAULT_ADMIN_ROLE) can cancel even though alice != admin as requester
        vm.prank(admin);
        ac.cancelRoleGrantRequest(BRAND_ADMIN, alice);

        (address reqBy,,) = ac.getRoleGrantRequest(BRAND_ADMIN, alice);
        assertEq(reqBy, address(0));
    }

    // ─────────────────────────────────────────────────────────────────
    // Suspension mechanism
    // ─────────────────────────────────────────────────────────────────

    function test_suspendRole_succeeds() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);

        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit RoleSuspended(OPERATOR, alice, "investigation", admin);
        ac.suspendRole(OPERATOR, alice, "investigation");

        assertTrue(ac.isSuspended(OPERATOR, alice));
    }

    function test_suspendRole_revertsWhenNotHolder() public {
        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: account does not have role");
        ac.suspendRole(OPERATOR, alice, "investigation");
    }

    function test_suspendRole_revertsAlreadySuspended() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        vm.prank(admin);
        ac.suspendRole(OPERATOR, alice, "reason");

        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: role already suspended");
        ac.suspendRole(OPERATOR, alice, "reason2");
    }

    function test_reinstateRole_succeeds() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        vm.prank(admin);
        ac.suspendRole(OPERATOR, alice, "reason");

        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit RoleReinstated(OPERATOR, alice, admin);
        ac.reinstateRole(OPERATOR, alice);

        assertFalse(ac.isSuspended(OPERATOR, alice));
    }

    function test_reinstateRole_revertsWhenNotSuspended() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);

        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: role is not suspended");
        ac.reinstateRole(OPERATOR, alice);
    }

    function test_isSuspended_defaultsFalse() public view {
        assertFalse(ac.isSuspended(OPERATOR, alice));
    }

    // ─────────────────────────────────────────────────────────────────
    // Emergency access
    // ─────────────────────────────────────────────────────────────────

    function test_emergencyGrantRole_succeeds() public {
        uint256 duration = 1 days;
        uint256 expiresAt = block.timestamp + duration;

        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit EmergencyAccessGranted(OPERATOR, alice, duration, expiresAt, "incident");
        ac.emergencyGrantRole(OPERATOR, alice, duration, "incident");

        (bool hasEmergency, uint256 expiry) = ac.getEmergencyAccess(OPERATOR, alice);
        assertTrue(hasEmergency);
        assertEq(expiry, expiresAt);
    }

    function test_emergencyGrantRole_revertsExceedMaxDuration() public {
        uint256 maxDuration = ac.MAX_EMERGENCY_DURATION();
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGalileoAccessControl.EmergencyDurationExceeded.selector,
                8 days,
                maxDuration
            )
        );
        ac.emergencyGrantRole(OPERATOR, alice, 8 days, "reason");
    }

    function test_emergencyGrantRole_revertsEmptyReason() public {
        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: reason required");
        ac.emergencyGrantRole(OPERATOR, alice, 1 days, "");
    }

    function test_emergencyGrantRole_onlyAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        ac.emergencyGrantRole(OPERATOR, bob, 1 days, "reason");
    }

    function test_getEmergencyAccess_falseWhenExpired() public {
        vm.prank(admin);
        ac.emergencyGrantRole(OPERATOR, alice, 1 hours, "reason");

        vm.warp(block.timestamp + 2 hours);

        (bool hasEmergency, uint256 expiry) = ac.getEmergencyAccess(OPERATOR, alice);
        assertFalse(hasEmergency);
        assertTrue(expiry > 0); // expiry is set but in the past
    }

    function test_getEmergencyAccess_falseWhenNeverGranted() public view {
        (bool hasEmergency, uint256 expiry) = ac.getEmergencyAccess(OPERATOR, alice);
        assertFalse(hasEmergency);
        assertEq(expiry, 0);
    }

    function test_emergencyRevokeAll_revokesRegularAndEmergencyRoles() public {
        // Grant alice some roles
        vm.startPrank(admin);
        ac.grantRole(OPERATOR, alice);
        ac.grantRole(AUDITOR, alice);
        ac.emergencyGrantRole(REGULATOR, alice, 1 days, "reason");
        vm.stopPrank();

        vm.prank(admin);
        ac.emergencyRevokeAll(alice, "security incident");

        assertFalse(ac.hasRole(OPERATOR, alice));
        assertFalse(ac.hasRole(AUDITOR, alice));
        (bool hasEmergency,) = ac.getEmergencyAccess(REGULATOR, alice);
        assertFalse(hasEmergency);
    }

    function test_emergencyRevokeAll_revertsEmptyReason() public {
        vm.prank(admin);
        vm.expectRevert("GalileoAccessControl: reason required");
        ac.emergencyRevokeAll(alice, "");
    }

    function test_emergencyRevokeAll_onlyAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        ac.emergencyRevokeAll(bob, "reason");
    }

    // ─────────────────────────────────────────────────────────────────
    // View functions
    // ─────────────────────────────────────────────────────────────────

    function test_canExerciseRole_trueWhenHasRole() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        assertTrue(ac.canExerciseRole(OPERATOR, alice));
    }

    function test_canExerciseRole_falseWhenSuspended() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        vm.prank(admin);
        ac.suspendRole(OPERATOR, alice, "reason");
        assertFalse(ac.canExerciseRole(OPERATOR, alice));
    }

    function test_canExerciseRole_falseWhenNoRole() public view {
        assertFalse(ac.canExerciseRole(OPERATOR, alice));
    }

    function test_canExerciseRole_trueWithActiveEmergencyAccess() public {
        vm.prank(admin);
        ac.emergencyGrantRole(OPERATOR, alice, 1 days, "reason");
        assertTrue(ac.canExerciseRole(OPERATOR, alice));
    }

    function test_canExerciseRole_falseWhenEmergencyExpired() public {
        vm.prank(admin);
        ac.emergencyGrantRole(OPERATOR, alice, 1 hours, "reason");
        vm.warp(block.timestamp + 2 hours);
        assertFalse(ac.canExerciseRole(OPERATOR, alice));
    }

    function test_getAccountRoles_returnsOwnedRoles() public {
        vm.startPrank(admin);
        ac.grantRole(OPERATOR, alice);
        ac.grantRole(AUDITOR, alice);
        vm.stopPrank();

        bytes32[] memory roles = ac.getAccountRoles(alice);
        assertEq(roles.length, 2);
        _assertContains(roles, OPERATOR);
        _assertContains(roles, AUDITOR);
    }

    function test_getAccountRoles_includesEmergencyAccess() public {
        vm.prank(admin);
        ac.emergencyGrantRole(REGULATOR, alice, 1 days, "reason");

        bytes32[] memory roles = ac.getAccountRoles(alice);
        _assertContains(roles, REGULATOR);
    }

    function test_getAccountRoles_excludesExpiredEmergencyAccess() public {
        vm.prank(admin);
        ac.emergencyGrantRole(REGULATOR, alice, 1 hours, "reason");
        vm.warp(block.timestamp + 2 hours);

        bytes32[] memory roles = ac.getAccountRoles(alice);
        _assertNotContains(roles, REGULATOR);
    }

    function test_getAccountRoles_emptyForUnknownAccount() public view {
        bytes32[] memory roles = ac.getAccountRoles(charlie);
        assertEq(roles.length, 0);
    }

    function test_getRoleGrantDelay_defaultsZero() public view {
        assertEq(ac.getRoleGrantDelay(BRAND_ADMIN), 0);
    }

    function test_setRoleGrantDelay_updatesDelay() public {
        vm.prank(admin);
        ac.setRoleGrantDelay(BRAND_ADMIN, 3 days);
        assertEq(ac.getRoleGrantDelay(BRAND_ADMIN), 3 days);
    }

    // ─────────────────────────────────────────────────────────────────
    // Standard AccessControl compatibility
    // ─────────────────────────────────────────────────────────────────

    function test_standardGrantRole_works() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        assertTrue(ac.hasRole(OPERATOR, alice));
    }

    function test_standardRevokeRole_works() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        vm.prank(admin);
        ac.revokeRole(OPERATOR, alice);
        assertFalse(ac.hasRole(OPERATOR, alice));
    }

    function test_getRoleMemberCount_tracked() public {
        vm.prank(admin);
        ac.grantRole(OPERATOR, alice);
        vm.prank(admin);
        ac.grantRole(OPERATOR, bob);
        assertEq(ac.getRoleMemberCount(OPERATOR), 2);
    }

    // ─────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────

    function _singletonArray(bytes32 val) internal pure returns (bytes32[] memory arr) {
        arr = new bytes32[](1);
        arr[0] = val;
    }

    function _assertContains(bytes32[] memory arr, bytes32 val) internal pure {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == val) return;
        }
        revert("expected value not found in array");
    }

    function _assertNotContains(bytes32[] memory arr, bytes32 val) internal pure {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == val) revert("unexpected value found in array");
        }
    }
}
