import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Specify the data migration function in with-clause

actor {
  // Data Models
  public type TrackingEvent = {
    timestamp : Time.Time;
    date : Text;
    time : Text;
    location : Text;
    status : Text;
    note : ?Text;
  };

  public type Shipment = {
    trackingNumber : Text;
    origin : Text;
    destination : Text;
    recipient : ?Text;
    events : [TrackingEvent];
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  // State storage
  let shipments = Map.empty<Text, Shipment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization, custom roles at ShippingCompany
  // Full type already imported via MixinAuthorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Shipment Data Transformation
  public type TrackingData = {
    date : Text;
    location : Text;
    status : Text;
    note : ?Text;
  };

  module TrackingData {
    public func compare(a : TrackingData, b : TrackingData) : Order.Order {
      Text.compare(a.date, b.date);
    };

    public func toText(data : TrackingData) : Text {
      "Date: " # data.date # " | Location: " # data.location # " | Status: " # data.status # " | Note: " # (
        switch (data.note) {
          case (null) { "None" };
          case (?note) { note };
        }
      );
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Admin: Generate tracking number using a deterministic, time-based approach
  public shared ({ caller }) func generateTrackingNumber() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can generate tracking numbers");
    };

    let prefix = "SHIP";
    let timestamp = Time.now();
    let suffix = timestamp.toText();

    let trackingNumber = prefix # "-" # suffix;
    if (shipments.containsKey(trackingNumber)) {
      Runtime.trap("Tracking number collision detected, please retry.");
    };
    trackingNumber;
  };

  // Admin (authenticated) API
  public shared ({ caller }) func createShipment(trackingNumber : Text, origin : Text, destination : Text, recipient : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create shipments");
    };

    if (shipments.containsKey(trackingNumber)) {
      Runtime.trap("Shipment already exists for this tracking number");
    };

    let newShipment : Shipment = {
      trackingNumber;
      origin;
      destination;
      recipient;
      events = [];
      createdAt = Time.now();
    };

    shipments.add(trackingNumber, newShipment);
  };

  public query func getLatestTrackingEvent(trackingNumber : Text) : async TrackingEvent {
    switch (shipments.get(trackingNumber)) {
      case (null) {
        Runtime.trap("Shipment not found");
      };
      case (?shipment) {
        if (shipment.events.size() == 0) {
          Runtime.trap("No tracking events found");
        };
        shipment.events[shipment.events.size() - 1];
      };
    };
  };

  public shared ({ caller }) func addTrackingEvent(trackingNumber : Text, event : TrackingEvent) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add tracking events");
    };
    switch (shipments.get(trackingNumber)) {
      case (null) {
        Runtime.trap("Shipment not found");
      };
      case (?shipment) {
        let updatedEvents = shipment.events.concat([event]);
        let updatedShipment = {
          shipment with
          events = updatedEvents;
        };
        shipments.add(trackingNumber, updatedShipment);
      };
    };
  };

  // Admin management API - list all shipments for administration
  public query ({ caller }) func getAllShipments() : async [Shipment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all shipments");
    };
    shipments.values().toArray();
  };

  // Initialize the first admin (canister installer/owner)
  public shared ({ caller }) func setInitialAdmin(adminToken : Text, userProvidedToken : Text) : async () {
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

  // Guest & public shipment tracking
  public query func getShipment(trackingNumber : Text) : async Shipment {
    switch (shipments.get(trackingNumber)) {
      case (null) {
        Runtime.trap("Shipment not found");
      };
      case (?shipment) {
        shipment;
      };
    };
  };

  // Helper functions for testing purposes
  public shared ({ caller }) func addTestShipments() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add test shipments");
    };

    let testTrackingNumbers = Array.tabulate(6, func(i) { "test-" # i.toText() });
    let testOrigins = Array.tabulate(6, func(i) { "Origin " # (i + 1).toText() });
    let testDestinations = Array.tabulate(6, func(i) { "Destination " # (i + 1).toText() });
    let testRecipients = Array.tabulate(6, func(i) { "Recipient " # (i + 1).toText() });
    let testShips = List.empty<Shipment>();

    let mutableTestShipment : { var trackingNumber : Text; var origin : Text; var destination : Text; var recipient : ?Text; var events : [TrackingEvent]; var createdAt : Time.Time } = {
      var trackingNumber = "";
      var origin = "";
      var destination = "";
      var recipient = null : ?Text;
      var events = [];
      var createdAt = 0;
    };

    let testRecipientsArray = testRecipients.values().toArray();

    for (i in testTrackingNumbers.keys()) {
      let recipient : ?Text = ?testRecipientsArray[i];
      let timestamp : Time.Time = 1337 + i * 1000;
      mutableTestShipment.trackingNumber := testTrackingNumbers[i];
      mutableTestShipment.origin := testOrigins[i];
      mutableTestShipment.destination := testDestinations[i];
      mutableTestShipment.recipient := recipient;
      mutableTestShipment.createdAt := timestamp;

      let events = [
        {
          timestamp;
          date = "2023-09-30";
          time = "10:00";
          location = "Warehouse";
          status = "Dispatched";
          note = ?"Package has been dispatched";
        },
        {
          timestamp;
          date = "2023-09-30";
          time = "12:30";
          location = "Transit";
          status = "In Transit";
          note = ?"The package is on its way.";
        },
      ];

      mutableTestShipment.events := events;
      testShips.add({
        trackingNumber = mutableTestShipment.trackingNumber;
        origin = mutableTestShipment.origin;
        destination = mutableTestShipment.destination;
        recipient = mutableTestShipment.recipient;
        events;
        createdAt = mutableTestShipment.createdAt;
      });
    };

    let t = testShips.values().toArray();
    let result = t.concat([{
      trackingNumber = "test";
      origin = "Origin";
      destination = "Origin";
      recipient = ?("Origin");
      events = [];
      createdAt = 1992;
    }]);
    for (shipment in result.values()) {
      shipments.add(shipment.trackingNumber, shipment);
    };
  };
};
