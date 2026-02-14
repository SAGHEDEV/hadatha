module hadatha_contract::events {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::display;
    use sui::package;
    use sui::coin::{Self, Coin};
    use std::type_name;
    use std::ascii;

    use hadatha_contract::profile::{Self, Account};

    // ====== Error Codes ======
    const EEventNotFound: u64 = 0;
    const ENotOrganizer: u64 = 1;
    const EEventFull: u64 = 2;
    const EAlreadyRegistered: u64 = 3;
    const EEventClosed: u64 = 4;
    const ECheckinNotAllowed: u64 = 5;
    const ENotRegistered: u64 = 6;
    const EAlreadyCheckedIn: u64 = 7;
    const EInvalidEventStatus: u64 = 8;
    const ENotCheckedIn: u64 = 11;
    const EAlreadyMintedNFT: u64 = 12;
    const ENFTNotEnabled: u64 = 13;
    const EInvalidTier: u64 = 15;
    const EInsufficientPayment: u64 = 16;
    const EInvalidCurrency: u64 = 17;

    // ====== Events ======
    public struct EventCreated has copy, drop {
        event_id: ID,
        creator: address,
        title: vector<u8>,
        event_hex: String,
        timestamp: u64,
    }

    public struct EventRegistered has copy, drop {
        event_id: ID,
        attendee: address,
        timestamp: u64,
    }

    public struct EventCheckedIn has copy, drop {
        event_id: ID,
        attendee: address,
        checked_in_by: address,
        timestamp: u64,
    }

    public struct EventUpdated has copy, drop {
        event_id: ID,
        event_hex: String,
        updated_by: address,
        timestamp: u64,
    }

    public struct AttendanceNFTMinted has copy, drop {
        nft_id: ID,
        event_id: ID,
        attendee: address,
        timestamp: u64,
    }

    public struct NFTCollectionEnabled has copy, drop {
        event_id: ID,
        enabled_by: address,
        timestamp: u64,
    }

    // ====== One-Time Witness ======
    public struct EVENTS has drop {}

    // ====== Structs ======
    public struct TicketTier has store, copy, drop {
        name: vector<u8>,
        price: u64,
        currency: ascii::String,
        capacity: u64,
        sold: u64,
    }

    public struct RegistrationField has copy, drop, store {
        name: vector<u8>,
        field_type: vector<u8>,
    }

    public struct RegistrationDetails has copy, drop, store {
        values: vector<vector<u8>>,
        checked_in: bool,
        checked_in_at: u64,
        registered_at: u64,
        nft_minted: bool,
        ticket_tier_index: u64,
    }

    public struct NFTConfig has store {
        enabled: bool,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        nft_image_url: vector<u8>,
        total_minted: u64,
    }

    public struct AttendanceNFT has key, store {
        id: UID,
        event_id: ID,
        event_title: vector<u8>,
        attendee_name: vector<u8>,
        attendee_address: address,
        check_in_time: u64,
        mint_time: u64,
        image_url: Url,
        description: String,
    }

    public struct Event has key, store {
        id: UID,
        title: vector<u8>,
        description: vector<u8>,
        location: vector<u8>,
        is_virtual: bool,
        link: vector<u8>,
        link_type: vector<u8>,
        is_anonymous: bool,
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
        event_hex: String,
        organizers: vector<address>,
        attendees: Table<address, RegistrationDetails>,
        attendees_count: u64,
        checked_in_count: u64,
        created_at: u64,
        updated_at: u64,
        registration_fields: vector<RegistrationField>,
        max_attendees: u64,
        tags: vector<vector<u8>>,
        allow_checkin: bool,
        ticket_tiers: vector<TicketTier>,
        status: vector<u8>,
        nft_config: NFTConfig,
    }

    public struct EventRegistry has key {
        id: UID,
        event_count: u64,
    }

    // ====== Init Function ======
    fun init(otw: EVENTS, ctx: &mut TxContext) {
        let registry = EventRegistry {
            id: object::new(ctx),
            event_count: 0,
        };
        transfer::share_object(registry);

        let publisher = package::claim(otw, ctx);
        let mut display = display::new<AttendanceNFT>(&publisher, ctx);
        
        display.add(b"name".to_string(), b"{event_title} - Attendance NFT".to_string());
        display.add(b"description".to_string(), b"{description}".to_string());
        display.add(b"image_url".to_string(), b"{image_url}".to_string());
        display.add(b"attendee".to_string(), b"{attendee_name}".to_string());
        display.add(b"project_url".to_string(), b"https://hadathaio.vercel.app".to_string());
        
        display.update_version();
        
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ====== Public Functions ======
    
    public entry fun create_event(
        registry: &mut EventRegistry,
        account: &mut Account,
        title: vector<u8>,
        description: vector<u8>,
        location: vector<u8>,
        is_virtual: bool,
        link: vector<u8>,
        link_type: vector<u8>,
        is_anonymous: bool,
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
        event_hex: String,
        registration_field_names: vector<vector<u8>>,
        registration_field_types: vector<vector<u8>>,
        event_organizers: vector<address>,
        max_attendees: u64,
        tags: vector<vector<u8>>,
        tier_names: vector<vector<u8>>,
        tier_prices: vector<u64>,
        tier_currencies: vector<ascii::String>,
        tier_capacities: vector<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        // Permission check: ensure sender is the owner of the account
        assert!(profile::get_owner(account) == sender, ENotOrganizer);

        let current_time = clock::timestamp_ms(clock);
        
        let mut organizers = vector::empty<address>();
        vector::push_back(&mut organizers, sender);

        let org_len = vector::length(&event_organizers);
        let mut j = 0;
        while (j < org_len) {
            let org = *vector::borrow(&event_organizers, j);
            if (!vector::contains(&organizers, &org)) {
                vector::push_back(&mut organizers, org);
            };
            j = j + 1;
        };

        let mut fields = vector::empty<RegistrationField>();
        let len = vector::length(&registration_field_names);
        let mut i = 0;
        while (i < len) {
            let f = RegistrationField {
                name: *vector::borrow(&registration_field_names, i),
                field_type: *vector::borrow(&registration_field_types, i),
            };
            vector::push_back(&mut fields, f);
            i = i + 1;
        };

        let mut ticket_tiers = vector::empty<TicketTier>();
        let tier_len = vector::length(&tier_names);
        let mut k = 0;
        while (k < tier_len) {
             let tier = TicketTier {
                  name: *vector::borrow(&tier_names, k),
                  price: *vector::borrow(&tier_prices, k),
                  currency: *vector::borrow(&tier_currencies, k),
                  capacity: *vector::borrow(&tier_capacities, k),
                  sold: 0,
             };
             vector::push_back(&mut ticket_tiers, tier);
             k = k + 1;
        };

        let event = Event {
            id: object::new(ctx),
            title,
            description,
            location,
            is_virtual,
            link,
            link_type,
            is_anonymous,
            start_time,
            end_time,
            image_url,
            event_hex,
            organizers,
            attendees: table::new(ctx),
            attendees_count: 0,
            checked_in_count: 0,
            created_at: current_time,
            updated_at: current_time,
            registration_fields: fields,
            max_attendees,
            tags,
            allow_checkin: false,
            ticket_tiers,
            status: b"ongoing",
            nft_config: NFTConfig {
                enabled: false,
                nft_name: vector::empty(),
                nft_description: vector::empty(),
                nft_image_url: vector::empty(),
                total_minted: 0,
            },
        };

        let event_id = object::id(&event);
        
        // Update account stats via package-protected function
        profile::increment_organized_count(account);
        
        // Update registry
        registry.event_count = registry.event_count + 1;

        event::emit(EventCreated {
            event_id,
            creator: sender,
            title: event.title,
            event_hex: event.event_hex,
            timestamp: current_time,
        });

        transfer::share_object(event);
    }

    public entry fun enable_nft_collection(
        event: &mut Event,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let current_time = clock::timestamp_ms(clock);
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        event.nft_config.enabled = true;
        event.nft_config.nft_name = nft_name;
        event.nft_config.nft_description = nft_description;
        event.nft_config.nft_image_url = nft_image_url;
        event.updated_at = current_time;

        event::emit(NFTCollectionEnabled {
            event_id: object::id(event),
            enabled_by: sender,
            timestamp: current_time,
        });
    }

    public entry fun mint_attendance_nft(
        event: &mut Event,
        account: &Account,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        mint_attendance_nft_internal(event, sender, profile::get_name(account), clock, ctx);
    }

    public entry fun mint_attendance_nft_guest(
        event: &mut Event,
        attendee_name: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        mint_attendance_nft_internal(event, sender, attendee_name, clock, ctx);
    }

    fun mint_attendance_nft_internal(
        event: &mut Event,
        attendee: address,
        attendee_name: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(event.nft_config.enabled, ENFTNotEnabled);
        assert!(table::contains(&event.attendees, attendee), ENotRegistered);

        let event_id_copy = object::id(event);
        let event_title_copy = event.title;
        let nft_img_copy = event.nft_config.nft_image_url;
        let nft_desc_copy = event.nft_config.nft_description;

        {
            let registration = table::borrow_mut(&mut event.attendees, attendee);
            assert!(registration.checked_in, ENotCheckedIn);
            assert!(!registration.nft_minted, EAlreadyMintedNFT);

            let nft = AttendanceNFT {
                id: object::new(ctx),
                event_id: event_id_copy,
                event_title: event_title_copy,
                attendee_name,
                attendee_address: attendee,
                check_in_time: registration.checked_in_at,
                mint_time: current_time,
                image_url: url::new_unsafe_from_bytes(nft_img_copy),
                description: string::utf8(nft_desc_copy),
            };

            let nft_id = object::id(&nft);
            registration.nft_minted = true;
            event.nft_config.total_minted = event.nft_config.total_minted + 1;

            event::emit(AttendanceNFTMinted {
                nft_id,
                event_id: event_id_copy,
                attendee,
                timestamp: current_time,
            });

            transfer::public_transfer(nft, attendee);
        }
    }

    public entry fun register_for_event<P>(
        event: &mut Event,
        account: &mut Account,
        registration_values: vector<vector<u8>>,
        tier_index: u64,
        payment: Coin<P>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        // Permission check: ensure sender is the owner of the account
        assert!(profile::get_owner(account) == sender, ENotOrganizer);

        register_for_event_internal<P>(event, sender, registration_values, tier_index, payment, clock, ctx);
        profile::increment_registered_count(account);
    }

    public entry fun register_for_event_guest<P>(
        event: &mut Event,
        registration_values: vector<vector<u8>>,
        tier_index: u64,
        payment: Coin<P>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        register_for_event_internal<P>(event, sender, registration_values, tier_index, payment, clock, ctx);
    }

    fun register_for_event_internal<P>(
        event: &mut Event,
        sender: address,
        registration_values: vector<vector<u8>>,
        tier_index: u64,
        mut payment: Coin<P>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(event.status != b"closed", EEventClosed);
        assert!(event.status != b"hidden", EEventClosed);
        assert!(!table::contains(&event.attendees, sender), EAlreadyRegistered);
        assert!(event.attendees_count < event.max_attendees, EEventFull);
        assert!(tier_index < vector::length(&event.ticket_tiers), EInvalidTier);

        let tier = vector::borrow_mut(&mut event.ticket_tiers, tier_index);
        assert!(tier.sold < tier.capacity, EEventFull);

        let paid = coin::value(&payment);
        assert!(paid >= tier.price, EInsufficientPayment);

        if (tier.price > 0) {
            let expected_currency = tier.currency;
            let actual_currency = type_name::into_string(type_name::get<P>());
            assert!(actual_currency == expected_currency, EInvalidCurrency);
            
            let to_organizer = *vector::borrow(&event.organizers, 0);
            if (paid == tier.price) {
                 transfer::public_transfer(payment, to_organizer);
            } else {
                 let amount_to_pay = coin::split(&mut payment, tier.price, ctx);
                 transfer::public_transfer(amount_to_pay, to_organizer);
                 transfer::public_transfer(payment, sender);
            };
        } else {
            if (paid > 0) {
                transfer::public_transfer(payment, sender);
            } else {
                coin::destroy_zero(payment);
            }
        };

        let registration = RegistrationDetails {
            values: registration_values,
            checked_in: false,
            checked_in_at: 0,
            registered_at: current_time,
            nft_minted: false,
            ticket_tier_index: tier_index,
        };

        table::add(&mut event.attendees, sender, registration);
        event.attendees_count = event.attendees_count + 1;
        tier.sold = tier.sold + 1;
        event.updated_at = current_time;

        event::emit(EventRegistered {
            event_id: object::id(event),
            attendee: sender,
            timestamp: current_time,
        });
    }

    public entry fun checkin_event(
        event: &mut Event,
        attendee: address,
        account: &mut Account,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let is_self = sender == attendee;
        
        checkin_event_internal(event, attendee, sender, clock);

        if (is_self) {
            assert!(profile::get_owner(account) == sender, ENotOrganizer);
            profile::increment_attended_count(account);
        };
    }

    public entry fun checkin_event_guest(
        event: &mut Event,
        attendee: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        checkin_event_internal(event, attendee, sender, clock);
    }

    fun checkin_event_internal(
        event: &mut Event,
        attendee: address,
        sender: address,
        clock: &Clock,
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(event.allow_checkin, ECheckinNotAllowed);
        assert!(table::contains(&event.attendees, attendee), ENotRegistered);

        let registration = table::borrow_mut(&mut event.attendees, attendee);
        assert!(!registration.checked_in, EAlreadyCheckedIn);

        let is_organizer = vector::contains(&event.organizers, &sender);
        let is_self = sender == attendee;
        assert!(is_organizer || is_self, ENotOrganizer);

        registration.checked_in = true;
        registration.checked_in_at = current_time;
        event.checked_in_count = event.checked_in_count + 1;
        event.updated_at = current_time;

        event::emit(EventCheckedIn {
            event_id: object::id(event),
            attendee,
            checked_in_by: sender,
            timestamp: current_time,
        });
    }

    public entry fun edit_event(
        event: &mut Event,
        title: vector<u8>,
        description: vector<u8>,
        location: vector<u8>,
        is_virtual: bool,
        link: vector<u8>,
        link_type: vector<u8>,
        is_anonymous: bool,
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
        event_hex: String,
        max_attendees: u64,
        registration_field_names: vector<vector<u8>>,
        registration_field_types: vector<vector<u8>>,
        tags: vector<vector<u8>>,
        tier_names: vector<vector<u8>>,
        tier_prices: vector<u64>,
        tier_currencies: vector<ascii::String>,
        tier_capacities: vector<u64>,
        organizers: vector<address>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let current_time = clock::timestamp_ms(clock);
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        let mut fields = vector::empty<RegistrationField>();
        let len = vector::length(&registration_field_names);
        let mut i = 0;
        while (i < len) {
            let f = RegistrationField {
                name: *vector::borrow(&registration_field_names, i),
                field_type: *vector::borrow(&registration_field_types, i),
            };
            vector::push_back(&mut fields, f);
            i = i + 1;
        };

        let mut ticket_tiers = vector::empty<TicketTier>();
        let tier_len = vector::length(&tier_names);
        let mut k = 0;
        while (k < tier_len) {
             let tier = TicketTier {
                  name: *vector::borrow(&tier_names, k),
                  price: *vector::borrow(&tier_prices, k),
                  currency: *vector::borrow(&tier_currencies, k),
                  capacity: *vector::borrow(&tier_capacities, k),
                  sold: 0, 
             };
             vector::push_back(&mut ticket_tiers, tier);
             k = k + 1;
        };

        event.title = title;
        event.description = description;
        event.location = location;
        event.is_virtual = is_virtual;
        event.link = link;
        event.link_type = link_type;
        event.is_anonymous = is_anonymous;
        event.start_time = start_time;
        event.end_time = end_time;
        event.image_url = image_url;
        event.event_hex = event_hex;
        event.max_attendees = max_attendees;
        event.tags = tags;
        event.ticket_tiers = ticket_tiers;
        event.updated_at = current_time;
        event.organizers = organizers;
        event.registration_fields = fields;

        event::emit(EventUpdated {
            event_id: object::id(event),
            event_hex: event.event_hex,
            updated_by: sender,
            timestamp: current_time,
        });
    }

    public entry fun toggle_allow_checkin(
        event: &mut Event,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let current_time = clock::timestamp_ms(clock);
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);
        event.allow_checkin = !event.allow_checkin;
        event.updated_at = current_time;
    }

    public entry fun update_event_status(
        event: &mut Event,
        status: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        let current_time = clock::timestamp_ms(clock);
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);
        assert!(status == b"ongoing" || status == b"closed" || status == b"hidden" || status == b"past", EInvalidEventStatus);
        event.status = status;
        event.updated_at = current_time;

        event::emit(EventUpdated {
            event_id: object::id(event),
            event_hex: event.event_hex,
            updated_by: sender,
            timestamp: current_time,
        });
    }

    // ====== View Functions ======
    
    public fun get_event_info(event: &Event): (vector<u8>, vector<u8>, u64, u64, vector<u8>, bool) {
        (event.title, event.description, event.attendees_count, event.checked_in_count, event.status, event.allow_checkin)
    }

    public fun get_nft_config(event: &Event): (bool, u64) {
        (event.nft_config.enabled, event.nft_config.total_minted)
    }

    public fun is_registered(event: &Event, attendee: address): bool {
        table::contains(&event.attendees, attendee)
    }
}
