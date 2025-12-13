module hadatha_contract::hadatha_contract {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};
    use sui::derived_object;
    use sui::url::{Self, Url};
    use sui::display;
    use sui::package;

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
    const EAccountAlreadyExists: u64 = 9;
    const EAccountExists: u64 = 10;
    const ENotCheckedIn: u64 = 11;
    const EAlreadyMintedNFT: u64 = 12;
    const ENFTNotEnabled: u64 = 13;
    const EEventNotEnded: u64 = 14;

    // ====== Events ======
    public struct EventCreated has copy, drop {
        event_id: ID,
        creator: address,
        title: vector<u8>,
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
        updated_by: address,
        timestamp: u64,
    }

    public struct AccountCreated has copy, drop {
        account_id: ID,
        owner: address,
        name: vector<u8>,
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
    public struct HADATHA_CONTRACT has drop {}

    // ====== Structs ======
    public struct AccountRoot has key {
        id: UID,
    }

    public struct Account has key {
        id: UID,
        name: vector<u8>,
        email: vector<u8>,
        image_url: vector<u8>,
        total_attended: u64,
        total_organized: u64,
        total_hosted: u64,
        total_registered: u64,
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
    }

    // NFT Configuration for each event
    public struct NFTConfig has store {
        enabled: bool,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        nft_image_url: vector<u8>,
        total_minted: u64,
    }

    // The Attendance NFT
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
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
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
        price: vector<u8>,
        status: vector<u8>, // "ongoing", "closed", "hidden", "past"
        nft_config: NFTConfig,
    }

    public struct EventRegistry has key {
        id: UID,
        event_count: u64,
    }

    // ====== Init Function ======
    fun init(otw: HADATHA_CONTRACT, ctx: &mut TxContext) {
        // Initialize EventRegistry
        let registry = EventRegistry {
            id: object::new(ctx),
            event_count: 0,
        };
        transfer::share_object(registry);

        // Initialize AccountRoot
        let account_root = AccountRoot {
            id: object::new(ctx),
        };
        transfer::share_object(account_root);

        // Create and setup Display for AttendanceNFT
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<AttendanceNFT>(&publisher, ctx);
        
        display.add(
            b"name".to_string(),
            b"{event_title} - Attendance NFT".to_string()
        );
        display.add(
            b"description".to_string(),
            b"{description}".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"{image_url}".to_string()
        );
        display.add(
            b"attendee".to_string(),
            b"{attendee_name}".to_string()
        );
        display.add(
            b"project_url".to_string(),
            b"https://hadatha.app".to_string()
        );
        
        display.update_version();
        
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ====== Account Functions ======
    
    /// Create a new account using derived object method
    public entry fun create_account(
        account_root: &mut AccountRoot,
        name: vector<u8>,
        email: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        assert!(
            !derived_object::exists(&account_root.id, sender),
            EAccountExists
        );
        let account = Account {
            id: derived_object::claim(&mut account_root.id, sender),
            name,
            email,
            image_url,
            total_attended: 0,
            total_organized: 0,
            total_hosted: 0,
            total_registered: 0,
        };

        let account_id = object::id(&account);
        
        event::emit(AccountCreated {
            account_id,
            owner: sender,
            name: account.name,
        });

        transfer::transfer(account, sender);
    }

    /// Edit user profile
    public entry fun edit_profile(
        account: &mut Account,
        name: vector<u8>,
        email: vector<u8>,
        image_url: vector<u8>,
        _ctx: &mut TxContext
    ) {
        account.name = name;
        account.email = email;
        account.image_url = image_url;
    }

    // ====== Event Functions ======
    
    /// Create a new event
    public entry fun create_event(
        registry: &mut EventRegistry,
        account: &mut Account,
        title: vector<u8>,
        description: vector<u8>,
        location: vector<u8>,
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
        registration_field_names: vector<vector<u8>>,
        registration_field_types: vector<vector<u8>>,
        event_organizers: vector<address>,
        max_attendees: u64,
        tags: vector<vector<u8>>,
        price: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        let mut organizers = vector::empty<address>();
        vector::push_back(&mut organizers, sender);

        let org_len = vector::length(&event_organizers);
        let mut j = 0;
        while (j < org_len) {
            let org = *vector::borrow(&event_organizers, j);
            vector::push_back(&mut organizers, org);
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

        let event = Event {
            id: object::new(ctx),
            title,
            description,
            location,
            start_time,
            end_time,
            image_url,
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
            price,
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
        
        // Update account stats
        account.total_organized = account.total_organized + 1;
        
        // Update registry
        registry.event_count = registry.event_count + 1;

        event::emit(EventCreated {
            event_id,
            creator: sender,
            title: event.title,
            timestamp: current_time,
        });

        transfer::share_object(event);
    }

    /// Enable NFT minting for an event (only organizers)
    public entry fun enable_nft_collection(
        event: &mut Event,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
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

    /// Update NFT collection details (only organizers)
    public entry fun update_nft_collection(
        event: &mut Event,
        nft_name: vector<u8>,
        nft_description: vector<u8>,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        event.nft_config.nft_name = nft_name;
        event.nft_config.nft_description = nft_description;
        event.nft_config.nft_image_url = nft_image_url;
        event.updated_at = current_time;
    }

    /// Disable NFT minting (only organizers)
    public entry fun disable_nft_collection(
        event: &mut Event,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        event.nft_config.enabled = false;
        event.updated_at = current_time;
    }

    /// Mint attendance NFT (only for checked-in attendees)
  public entry fun mint_attendance_nft(
    event: &mut Event,
    account: &Account,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);

    // Check if NFT minting is enabled
    assert!(event.nft_config.enabled, ENFTNotEnabled);

    // Check if attendee is registered
    assert!(table::contains(&event.attendees, sender), ENotRegistered);

    //
    // ---- PRE-EXTRACT ALL EVENT FIELDS BEFORE MUT BORROW ----
    //
    let event_id_copy = object::id(event);
    let event_title_copy = event.title;
    let nft_img_copy = event.nft_config.nft_image_url;
    let nft_desc_copy = event.nft_config.nft_description;

    {
        let registration = table::borrow_mut(&mut event.attendees, sender);

        // Check if attendee has checked in
        assert!(registration.checked_in, ENotCheckedIn);

        // Check if NFT already minted
        assert!(!registration.nft_minted, EAlreadyMintedNFT);

        // Build the NFT *without touching `event` again*
        let nft = AttendanceNFT {
            id: object::new(ctx),
            event_id: event_id_copy,
            event_title: event_title_copy,
            attendee_name: account.name,
            attendee_address: sender,
            check_in_time: registration.checked_in_at,
            mint_time: current_time,
            image_url: url::new_unsafe_from_bytes(nft_img_copy),
            description: string::utf8(nft_desc_copy),
        };

        let nft_id = object::id(&nft);

        // Update attendee record
        registration.nft_minted = true;

        // Update event metadata (still allowed because we're still inside the borrow)
        event.nft_config.total_minted = event.nft_config.total_minted + 1;

        // ---- End mutable borrow after this block ----

        // Emit event (now allowed)
        event::emit(AttendanceNFTMinted {
            nft_id,
            event_id: event_id_copy,
            attendee: sender,
            timestamp: current_time,
        });

        // Transfer NFT to user
        transfer::public_transfer(nft, sender);
    }
}


    /// Admin mint NFT for attendee (only organizers)
  public entry fun admin_mint_nft_for_attendee(
    event: &mut Event,
    attendee: address,
    attendee_account: &Account,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);

    // Check if sender is an organizer
    assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

    // Check if NFT minting is enabled
    assert!(event.nft_config.enabled, ENFTNotEnabled);

    // Check if attendee is registered
    assert!(table::contains(&event.attendees, attendee), ENotRegistered);

    // PRE-EXTRACT EVERYTHING YOU NEED FROM `event` BEFORE BORROWING MUTABLY
    let event_id_copy = object::id(event);
    let event_title_copy = event.title;
    let nft_image_url_copy = event.nft_config.nft_image_url;
    let nft_description_copy = event.nft_config.nft_description;

    // Now borrow mutably
    {
        let registration = table::borrow_mut(&mut event.attendees, attendee);

        // Check if attendee has checked in
        assert!(registration.checked_in, ENotCheckedIn);

        // Check if NFT already minted
        assert!(!registration.nft_minted, EAlreadyMintedNFT);

        // Prepare the NFT (note: avoid using `event` here!)
        let nft = AttendanceNFT {
            id: object::new(ctx),
            event_id: event_id_copy,
            event_title: event_title_copy,
            attendee_name: attendee_account.name,
            attendee_address: attendee,
            check_in_time: registration.checked_in_at,
            mint_time: current_time,
            image_url: url::new_unsafe_from_bytes(nft_image_url_copy),
            description: string::utf8(nft_description_copy),
        };

        let nft_id = object::id(&nft);

        // Mark as minted
        registration.nft_minted = true;

        // Increment total minted
        event.nft_config.total_minted = event.nft_config.total_minted + 1;

        // Emit event — safe because the mutable borrow ends after this block
        event::emit(AttendanceNFTMinted {
            nft_id,
            event_id: event_id_copy,
            attendee,
            timestamp: current_time,
        });

        // Transfer NFT
        transfer::public_transfer(nft, attendee);
    }
}


    /// Register for an event
    public entry fun register_for_event(
        event: &mut Event,
        account: &mut Account,
        registration_values: vector<vector<u8>>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if event is closed
        assert!(event.status != b"closed", EEventClosed);
        assert!(event.status != b"hidden", EEventClosed);

        // Check if already registered
        assert!(!table::contains(&event.attendees, sender), EAlreadyRegistered);

        // Check if event is full
        assert!(event.attendees_count < event.max_attendees, EEventFull);

        let registration = RegistrationDetails {
            values: registration_values,
            checked_in: false,
            checked_in_at: 0,
            registered_at: current_time,
            nft_minted: false,
        };

        table::add(&mut event.attendees, sender, registration);
        event.attendees_count = event.attendees_count + 1;
        event.updated_at = current_time;

        // Update account stats
        account.total_registered = account.total_registered + 1;

        event::emit(EventRegistered {
            event_id: object::id(event),
            attendee: sender,
            timestamp: current_time,
        });
    }

    /// Edit an event (only organizers)
    public entry fun edit_event(
        event: &mut Event,
        title: vector<u8>,
        description: vector<u8>,
        location: vector<u8>,
        start_time: u64,
        end_time: u64,
        image_url: vector<u8>,
        max_attendees: u64,
        registration_field_names: vector<vector<u8>>,
        registration_field_types: vector<vector<u8>>,
        tags: vector<vector<u8>>,
        price: vector<u8>,
        organizers: vector<address>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
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

        event.title = title;
        event.description = description;
        event.location = location;
        event.start_time = start_time;
        event.end_time = end_time;
        event.image_url = image_url;
        event.max_attendees = max_attendees;
        event.tags = tags;
        event.price = price;
        event.updated_at = current_time;
        event.organizers = organizers;
        event.registration_fields = fields;

        event::emit(EventUpdated {
            event_id: object::id(event),
            updated_by: sender,
            timestamp: current_time,
        });
    }

    /// Toggle check-in allowance
    public entry fun toggle_allow_checkin(
        event: &mut Event,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        event.allow_checkin = !event.allow_checkin;
        event.updated_at = current_time;
    }

    /// Check-in to an event (self check-in or admin check-in)
    public entry fun checkin_event(
        event: &mut Event,
        attendee: address,
        account: &mut Account,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if check-in is allowed
        assert!(event.allow_checkin, ECheckinNotAllowed);

        // Check if attendee is registered
        assert!(table::contains(&event.attendees, attendee), ENotRegistered);

        let registration = table::borrow_mut(&mut event.attendees, attendee);

        // Check if already checked in
        assert!(!registration.checked_in, EAlreadyCheckedIn);

        // Check if sender is organizer or self check-in
        let is_organizer = vector::contains(&event.organizers, &sender);
        let is_self = sender == attendee;
        assert!(is_organizer || is_self, ENotOrganizer);

        registration.checked_in = true;
        registration.checked_in_at = current_time;
        event.checked_in_count = event.checked_in_count + 1;
        event.updated_at = current_time;

        // Update account stats if it's the attendee's own check-in
        if (is_self) {
            account.total_attended = account.total_attended + 1;
        };

        event::emit(EventCheckedIn {
            event_id: object::id(event),
            attendee,
            checked_in_by: sender,
            timestamp: current_time,
        });
    }

    /// Hide an event (only organizers)
    public entry fun hide_event(
        event: &mut Event,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        event.status = b"hidden";
        event.updated_at = current_time;

        event::emit(EventUpdated {
            event_id: object::id(event),
            updated_by: sender,
            timestamp: current_time,
        });
    }

    /// Update event status (only organizers)
    public entry fun update_event_status(
        event: &mut Event,
        status: vector<u8>, // "ongoing", "closed", "hidden", "past"
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        // Validate status
        assert!(
            status == b"ongoing" || 
            status == b"closed" || 
            status == b"hidden" || 
            status == b"past",
            EInvalidEventStatus
        );

        event.status = status;
        event.updated_at = current_time;

        event::emit(EventUpdated {
            event_id: object::id(event),
            updated_by: sender,
            timestamp: current_time,
        });
    }

    /// Add organizer to event (only existing organizers)
    public entry fun add_organizer(
        event: &mut Event,
        new_organizer: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        // Add new organizer if not already added
        if (!vector::contains(&event.organizers, &new_organizer)) {
            vector::push_back(&mut event.organizers, new_organizer);
            event.updated_at = current_time;
        };
    }

    /// Remove organizer from event (only existing organizers, cannot remove self if last organizer)
    public entry fun remove_organizer(
        event: &mut Event,
        organizer_to_remove: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if sender is an organizer
        assert!(vector::contains(&event.organizers, &sender), ENotOrganizer);

        // Find and remove organizer
        let (exists, index) = vector::index_of(&event.organizers, &organizer_to_remove);
        if (exists && vector::length(&event.organizers) > 1) {
            vector::remove(&mut event.organizers, index);
            event.updated_at = current_time;
        };
    }

    // ====== View Functions ======
    
    /// Get event details
    public fun get_event_info(event: &Event): (
        vector<u8>, // title
        vector<u8>, // description
        u64,        // attendees_count
        u64,        // checked_in_count
        vector<u8>, // status
        bool,       // allow_checkin
    ) {
        (
            event.title,
            event.description,
            event.attendees_count,
            event.checked_in_count,
            event.status,
            event.allow_checkin,
        )
    }

    /// Get NFT config
    public fun get_nft_config(event: &Event): (bool, u64) {
        (event.nft_config.enabled, event.nft_config.total_minted)
    }

    /// Check if address is registered
    public fun is_registered(event: &Event, attendee: address): bool {
        table::contains(&event.attendees, attendee)
    }

    /// Check if address is checked in
    public fun is_checked_in(event: &Event, attendee: address): bool {
        if (!table::contains(&event.attendees, attendee)) {
            return false
        };
        let registration = table::borrow(&event.attendees, attendee);
        registration.checked_in
    }

    /// Check if NFT has been minted
    public fun has_minted_nft(event: &Event, attendee: address): bool {
        if (!table::contains(&event.attendees, attendee)) {
            return false
        };
        let registration = table::borrow(&event.attendees, attendee);
        registration.nft_minted
    }

    /// Get account info
    public fun get_account_stats(account: &Account): (u64, u64, u64, u64) {
        (
            account.total_attended,
            account.total_organized,
            account.total_hosted,
            account.total_registered,
        )
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(HADATHA_CONTRACT {}, ctx);
    }
}