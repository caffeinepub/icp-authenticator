import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

actor {
  stable var owner : ?Principal = null;
  stable var accounts : [{id: Nat; accountName: Text; issuer: Text; secret: Text}] = [];
  stable var nextId : Nat = 0;

  public shared(msg) func register() : async Result.Result<(), Text> {
    switch (owner) {
      case (null) {
        owner := ?msg.caller;
        #ok(())
      };
      case (?o) {
        if (o == msg.caller) { #ok(()) }
        else { #err("Already claimed by another principal") }
      };
    }
  };

  public query func getOwner() : async ?Principal {
    owner
  };

  public shared(msg) func addAccount(accountName: Text, issuer: Text, secret: Text) : async Result.Result<Nat, Text> {
    switch (owner) {
      case (?o) {
        if (o != msg.caller) { return #err("Unauthorized") };
      };
      case (null) { return #err("Not initialized") };
    };
    let id = nextId;
    nextId += 1;
    accounts := Array.append(accounts, [{id; accountName; issuer; secret}]);
    #ok(id)
  };

  public shared query(msg) func getAccounts() : async Result.Result<[{id: Nat; accountName: Text; issuer: Text; secret: Text}], Text> {
    switch (owner) {
      case (?o) {
        if (o != msg.caller) { return #err("Unauthorized") };
      };
      case (null) { return #err("Not initialized") };
    };
    #ok(accounts)
  };

  public shared(msg) func deleteAccount(id: Nat) : async Result.Result<(), Text> {
    switch (owner) {
      case (?o) {
        if (o != msg.caller) { return #err("Unauthorized") };
      };
      case (null) { return #err("Not initialized") };
    };
    accounts := Array.filter(accounts, func(a: {id: Nat; accountName: Text; issuer: Text; secret: Text}) : Bool {
      a.id != id
    });
    #ok(())
  };
};
