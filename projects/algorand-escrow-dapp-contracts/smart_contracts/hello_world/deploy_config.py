import logging
import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    from smart_contracts.artifacts.hello_world.hello_world_client import (
        HelloArgs,
        HelloWorldFactory,
        RegisterAgencyArgs,
        SearchAgenciesArgs,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        HelloWorldFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Test hello method
    try:
        response = app_client.send.hello(args=HelloArgs(name="world"))
        logger.info(f"✅ Hello test: {response.abi_return}")
    except Exception as e:
        logger.error(f"❌ Hello failed: {e}")
        return

    # Test service info (no args needed)
    try:
        info_response = app_client.send.get_service_info()
        logger.info(f"✅ Service info: {info_response.abi_return}")
    except Exception as e:
        logger.error(f"❌ Service info failed: {e}")
        return

    # Test stats (no args needed)
    try:
        stats_response = app_client.send.get_stats()
        logger.info(f"✅ Stats: {stats_response.abi_return}")
    except Exception as e:
        logger.warning(f"⚠️ Stats failed: {e}")

    # Test agency registration
    try:
        register_response = app_client.send.register_agency(
            args=RegisterAgencyArgs(
                agency_name="Test Agency",
                description="Web Development Services",
                contact_info="test@agency.com",
                wallet_address="TESTADDRESS123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            )
        )
        logger.info(f"✅ Registration: {register_response.abi_return}")
    except Exception as e:
        logger.warning(f"⚠️ Registration failed: {e}")

    # Test search
    try:
        search_response = app_client.send.search_agencies(
            args=SearchAgenciesArgs(search_term="Web")
        )
        logger.info(f"✅ Search: {search_response.abi_return}")
    except Exception as e:
        logger.warning(f"⚠️ Search failed: {e}")

    # Test get all agencies (no args needed)
    try:
        all_agencies_response = app_client.send.get_all_agencies()
        logger.info(f"✅ All agencies: {all_agencies_response.abi_return}")
    except Exception as e:
        logger.warning(f"⚠️ Get all agencies failed: {e}")

    logger.info(f"🎉 Deployment completed! App ID: {app_client.app_id}")
