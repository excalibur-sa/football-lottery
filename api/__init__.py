from config import DATA_PROVIDER


def get_data_provider():
    if DATA_PROVIDER == 'sporttery':
        from api.sporttery_provider import SportteryProvider
        return SportteryProvider()
    elif DATA_PROVIDER == 'jisuapi':
        from api.jisuapi_provider import JisuAPIProvider
        return JisuAPIProvider()
    else:
        from api.mock_provider import MockProvider
        return MockProvider()
