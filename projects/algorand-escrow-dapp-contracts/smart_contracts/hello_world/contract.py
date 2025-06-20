from algopy import ARC4Contract, String, UInt64, GlobalState
from algopy.arc4 import abimethod


class HelloWorld(ARC4Contract):
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

        # In a real implementation, you would store this data in box storage
        # For now, just increment the counter
        self.total_agencies.value = self.total_agencies.value + UInt64(1)

        return String("Agency registered successfully: ") + name

    @abimethod()
    def search_agencies(self, search_term: String) -> String:
        """Allow clients to search for agencies"""

        # Increment search counter
        self.total_searches.value = self.total_searches.value + UInt64(1)

        return String("Search results for: ") + search_term + String(" (Found agencies will be listed here)")

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
        return String("Client-Agency Registry - Active and tracking registrations")

    @abimethod()
    def hello(self, name: String) -> String:
        """Keep the original hello method for compatibility"""
        return String("Hello, ") + name
