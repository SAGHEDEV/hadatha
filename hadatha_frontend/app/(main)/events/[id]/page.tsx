import EventDetails from "@/components/miscellneous/EventDetails";
import { Event } from "@/types";


// Mock Data
const event: Event = {
    id: "1",
    title: "Sui Builder House: Lagos",
    description: "Join us for the first-ever Sui Builder House in Lagos! This event brings together developers, creators, and enthusiasts from across the ecosystem. Expect deep dives into Move programming, hands-on workshops, and networking opportunities with the Sui Foundation team. Whether you're a seasoned web3 developer or just starting, this is the place to be.",
    date: "December 15, 2025",
    start_time: "10:00 AM",
    end_time: "04:00 AM",
    location: "Eko Hotel & Suites, Victoria Island, Lagos",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    organizers: [
        {
            name: "Sui Foundation",
            avatarUrl: "https://cryptologos.cc/logos/sui-sui-logo.png",
        },
        {
            name: "Mysten Labs",
            avatarUrl: "https://cryptologos.cc/logos/sui-sui-logo.png",
        }
    ],
    attendees: [
        "https://ui-avatars.com/api/?name=John+Doe&background=random",
        "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
        "https://ui-avatars.com/api/?name=Alex+Johnson&background=random",
        "https://ui-avatars.com/api/?name=Sarah+Williams&background=random",
        "https://ui-avatars.com/api/?name=Mike+Brown&background=random"
    ],
    attendeesCount: 450,
    tags: ["Technology", "Blockchain", "Networking"],
    registration_fields: [
        { name: "Full Name", type: "text" },
        { name: "Email", type: "email" },
        { name: "GitHub Profile", type: "text" }
    ]
};

const EventDetailsPage = () => {
    return (
        <EventDetails event={event} />
    );
};

export default EventDetailsPage;