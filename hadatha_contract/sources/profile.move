module hadatha_contract::profile {
    use sui::event;
    use std::string::String;
    use sui::derived_object;

    // ====== Error Codes ======
    const EAccountExists: u64 = 10;

    // ====== Events ======
    public struct AccountCreated has copy, drop {
        account_id: ID,
        owner: address,
        name: vector<u8>,
    }

    // ====== One-Time Witness ======
    public struct PROFILE has drop {}

    // ====== Structs ======
    public struct AccountRoot has key {
        id: UID,
    }

    // ====== Init Function ======
    fun init(_otw: PROFILE, ctx: &mut TxContext) {
        let account_root = AccountRoot {
            id: object::new(ctx),
        };
        transfer::share_object(account_root);
    }

    public struct Account has key {
        id: UID,
        name: vector<u8>,
        email: vector<u8>,
        bio: vector<u8>,
        twitter: vector<u8>,
        github: vector<u8>,
        website: vector<u8>,
        image_url: vector<u8>,
        owner: address,
        total_attended: u64,
        total_organized: u64,
        total_hosted: u64,
        total_registered: u64,
    }

    // ====== Public Functions ======
    
    /// Create a new account using derived object method
    public entry fun create_account(
        account_root: &mut AccountRoot,
        name: vector<u8>,
        email: vector<u8>,
        bio: vector<u8>,
        twitter: vector<u8>,
        github: vector<u8>,
        website: vector<u8>,
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
            bio,
            twitter,
            github,
            website,
            image_url,
            owner: sender,
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
        bio: vector<u8>,
        twitter: vector<u8>,
        github: vector<u8>,
        website: vector<u8>,
        image_url: vector<u8>,
        _ctx: &mut TxContext
    ) {
        account.name = name;
        account.email = email;
        account.bio = bio;
        account.twitter = twitter;
        account.github = github;
        account.website = website;
        account.image_url = image_url;
    }

    // ====== Package Functions (Helper for other modules) ======

    public(package) fun increment_organized_count(account: &mut Account) {
        account.total_organized = account.total_organized + 1;
    }

    public(package) fun increment_attended_count(account: &mut Account) {
        account.total_attended = account.total_attended + 1;
    }

    public(package) fun increment_registered_count(account: &mut Account) {
        account.total_registered = account.total_registered + 1;
    }

    // ====== View Functions ======

    public fun get_account_stats(account: &Account): (u64, u64, u64, u64) {
        (
            account.total_attended,
            account.total_organized,
            account.total_hosted,
            account.total_registered,
        )
    }

    public fun get_owner(account: &Account): address {
        account.owner
    }

    public fun get_name(account: &Account): vector<u8> {
        account.name
    }

    // ====== Setup Helper (Internal entry or Package call) ======
    
    public(package) fun create_account_root(ctx: &mut TxContext) {
        let account_root = AccountRoot {
            id: object::new(ctx),
        };
        transfer::share_object(account_root);
    }
}
