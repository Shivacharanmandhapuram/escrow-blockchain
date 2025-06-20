from algopy import ARC4Contract, String, UInt64, Bytes, GlobalState, arc4
from algopy.arc4 import abimethod, Struct


class Agency(Struct):
    name: String
    description: String
    contact_info: String
    registration_timestamp: UInt64
    is_active: arc4.Bool


class ClientAgencyRegistry(ARC4Contract):
    def __init__(self) -> None:
        self.total_agencies = GlobalState(UInt64(0))
        self.total_searches = GlobalState(UInt64(0))

    @abimethod()
    def register_agency(
        self,
        name: String,
        description: String,
        contact_info: String
    ) -> String:
        """Register a new agency on the blockchain"""

        # Create agency record
        agency = Agency(
            name=name,
            description=description,
            contact_info=contact_info,
            registration_timestamp=UInt64(1),  # In real implementation, use Global.latest_timestamp
            is_active=arc4.Bool(True)
        )

        # Store agency data (using sender address as key)
        # In a real implementation, you'd use box storage for scalability

        # Increment total agencies counter
        self.total_agencies.value = self.total_agencies.value + UInt64(1)

        return "Agency registered successfully: " + name

    @abimethod()
    def search_agencies(self, search_term: String) -> String:
        """Allow clients to search for agencies"""

        # Increment search counter
        self.total_searches.value = self.total_searches.value + UInt64(1)

        # In a real implementation, this would search through stored agencies
        # For now, return a simple response
        return "Search results for: " + search_term + " (Found agencies will be listed here)"

    @abimethod()
    def get_agency_count(self) -> UInt64:
        """Get total number of registered agencies"""
        return self.total_agencies.value

    @abimethod()
    def get_search_count(self) -> UInt64:
        """Get total number of searches performed"""
        return self.total_searches.value

    @abimethod()
    def get_registry_info(self) -> String:
        """Get basic registry information"""
        return "Client-Agency Registry - Agencies: " + String.from_bytes(self.total_agencies.value.bytes) + ", Searches: " + String.from_bytes(self.total_searches.value.bytes)
