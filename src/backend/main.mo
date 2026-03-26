import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import UserApproval "user-approval/approval";



actor {
  // Attach mixin authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Include approval system
  let approvalState = UserApproval.initState(accessControlState);

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Types
  module Kwarran {
    public func compare(a : { id : Nat }, b : { id : Nat }) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type Kwarran = {
    id : Nat;
    name : Text;
    hasSecretariat : Bool;
    secretariatStatus : Text;
    secretariatAddress : Text;
    email : Text;
    facebook : Text;
    instagram : Text;
    hasCampground : Bool;
    campgroundStatus : Text;
    serviceTermStart : Text;
    serviceTermEnd : Text;
    skDocument : Text;
    youngMembersCount : Nat;
    adultMembersCount : Nat;
    maleGugusdepanCount : Nat;
    femaleGugusdepanCount : Nat;
    satgasPramukaPeduliCount : Nat;
    secretariatStaffCount : Nat;
    activeSatuanKaryaCount : Nat;
    satuanKaryaNames : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type ProgramItem = {
    frekuensi : Nat;
    keterangan : Text;
  };

  // Storage
  let kwarranStore = Map.empty<Nat, Kwarran>();
  var nextKwarranId = 1;

  // CRUD Operations
  public shared ({ caller }) func createKwarran(kwarran : Kwarran) : async Nat {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can create Kwarran records");
    };

    let now = Time.now();
    let newId = nextKwarranId;
    nextKwarranId += 1;

    let newKwarran : Kwarran = {
      kwarran with
      id = newId;
      createdAt = now;
      updatedAt = now;
    };

    kwarranStore.add(newId, newKwarran);
    newId;
  };

  public shared ({ caller }) func updateKwarran(id : Nat, kwarran : Kwarran) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can update Kwarran records");
    };

    switch (kwarranStore.get(id)) {
      case (null) { Runtime.trap("Kwarran not found") };
      case (?existing) {
        let updated : Kwarran = {
          kwarran with
          id;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        kwarranStore.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getKwarran(id : Nat) : async ?Kwarran {
    kwarranStore.get(id);
  };

  public query ({ caller }) func listKwarran() : async [Kwarran] {
    kwarranStore.values().toArray().sort();
  };

  public shared ({ caller }) func deleteKwarran(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete Kwarran records");
    };

    kwarranStore.remove(id);
  };
};
