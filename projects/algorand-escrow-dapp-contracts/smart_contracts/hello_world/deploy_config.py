import logging
import algokit_utils

logger = logging.getLogger(__name__)


def deploy() -> None:
    from smart_contracts.artifacts.hello_world.hello_world_client import (
        ClientAgencyRegistryFactory,
    )

    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    factory = algorand.client.get_typed_app_factory(
        ClientAgencyRegistryFactory, default_sender=deployer_.address
    )

    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        # Fund the app account
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    # Test the registry
    response = app_client.send.get_registry_info()
    logger.info(
        f"Deployed Client-Agency Registry ({app_client.app_id}) "
        f"Status: {response.abi_return}"
    )
