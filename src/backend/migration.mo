import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Principal "mo:core/Principal";

module {
  type OldKwarran = {
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

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    kwarranStore : Map.Map<Nat, OldKwarran>;
    nextKwarranId : Nat;
  };

  type NewKwarran = OldKwarran;
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    approvalState : UserApproval.UserApprovalState;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    kwarranStore : Map.Map<Nat, NewKwarran>;
    nextKwarranId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      approvalState = UserApproval.initState(old.accessControlState);
    };
  };
};
