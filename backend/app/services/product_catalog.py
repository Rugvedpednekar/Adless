from dataclasses import dataclass
from pathlib import Path


PRODUCT_ASSET_ROOT = Path(__file__).resolve().parents[2] / "product-assets"


@dataclass(frozen=True)
class ProductAsset:
    campaign_id: str
    brand: str
    product_name: str
    category: str
    asset_path: Path


PRODUCTS = {
    "camp_001": ProductAsset(
        campaign_id="camp_001",
        brand="CrunchPop",
        product_name="CrunchPop Classic Chips",
        category="snack",
        asset_path=PRODUCT_ASSET_ROOT / "crunchpop.png",
    )
}


def get_product_asset(campaign_id: str) -> ProductAsset | None:
    product = PRODUCTS.get(campaign_id)
    if product is None or not product.asset_path.is_file():
        return None
    return product

