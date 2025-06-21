from algopy import ARC4Contract, String, GlobalState
from algopy.arc4 import abimethod


class HelloWorld(ARC4Contract):
    def __init__(self) -> None:
        # Use String for counters to avoid UInt64 frontend issues
        self.agency_count = GlobalState(String("0"))
        self.search_count = GlobalState(String("0"))

        # Store agencies as: name|description|contact|address;
        self.agencies_list = GlobalState(String(""))

    @abimethod()
    def hello(self, name: String) -> String:
        """Test connectivity"""
        return String("Hello ") + name + String(" - Welcome to Escrow Service!")

    @abimethod()
    def register_agency(
        self,
        agency_name: String,
        description: String,
        contact_info: String,
        wallet_address: String
    ) -> String:
        """Register agency with wallet address for escrow"""
        # Create agency entry: name|description|contact|address;
        agency_entry = agency_name + String("|") + description + String("|") + contact_info + String("|") + wallet_address + String(";")

        # Add to agencies list
        current_list = self.agencies_list.value
        self.agencies_list.value = current_list + agency_entry

        # Increment counter (simplified)
        current_count = self.agency_count.value
        if current_count == String("0"):
            self.agency_count.value = String("1")
        elif current_count == String("1"):
            self.agency_count.value = String("2")
        elif current_count == String("2"):
            self.agency_count.value = String("3")
        else:
            self.agency_count.value = String("3+")

        return String("SUCCESS:Agency ") + agency_name + String(" registered for escrow service")

    @abimethod()
    def search_agencies(self, search_term: String) -> String:
        """Search agencies by name or service"""
        # Increment search counter
        current_count = self.search_count.value
        if current_count == String("0"):
            self.search_count.value = String("1")
        elif current_count == String("1"):
            self.search_count.value = String("2")
        else:
            self.search_count.value = String("2+")

        # Return all agencies with search marker
        agencies_data = self.agencies_list.value
        return String("SEARCH_RESULTS:") + search_term + String(":") + agencies_data

    @abimethod()
    def get_all_agencies(self) -> String:
        """Get all registered agencies"""
        return String("ALL_AGENCIES:") + self.agencies_list.value

    @abimethod()
    def get_stats(self) -> String:
        """Get service statistics"""
        return String("STATS:Agencies:") + self.agency_count.value + String(":Searches:") + self.search_count.value

    @abimethod()
    def get_service_info(self) -> String:
        """Get service information"""
        return String("Algorand Escrow Service - Connecting Clients with Trusted Agencies")
