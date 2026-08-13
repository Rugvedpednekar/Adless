from dataclasses import dataclass
from pathlib import Path

PRODUCT_ASSET_ROOT=Path(__file__).resolve().parents[2]/"product-assets"
@dataclass(frozen=True)
class ProductAsset:
    product_id:str; campaign_id:str; brand:str; product_name:str; category:str; price:str
    asset_path:Path; thumbnail:str; landing_path:str; compatible_surfaces:tuple[str,...]; compatible_environments:tuple[str,...]

def product(product_id,campaign_id,brand,name,category,price,surfaces,environments=()):
    filename="crunchpop.png" if product_id=="crunchpop-classic" else f"{product_id}.png"
    return ProductAsset(product_id,campaign_id,brand,name,category,price,PRODUCT_ASSET_ROOT/filename,"/assets/thumb-ai-placement.svg",f"/products/{product_id}",tuple(surfaces),tuple(environments))

PRODUCTS=(
 product("crunchpop-classic","camp_001","CrunchPop","CrunchPop Classic Chips","snack","$3.99",["coffee_table","kitchen_table","kitchen_counter","desk"],["living_room","kitchen","office","gaming_room"]),
 product("nova-cola-original","camp_002","Nova Cola","Nova Cola Original","beverage","$2.49",["coffee_table","kitchen_table","kitchen_counter","desk"]),
 product("beanbox-roast","camp_003","BeanBox","BeanBox Roast","coffee","$12.99",["desk","kitchen_counter","coffee_table","kitchen_table"]),
 product("pagenest-modern-developer","camp_004","PageNest","The Modern Developer","book","$19.99",["coffee_table","desk","shelf","side_table"]),
 product("voltbook-air","camp_005","VoltBook","VoltBook Air","electronics","$899",["desk","table","workspace"]),
 product("soundpod-studio","camp_006","SoundPod","SoundPod Studio","electronics","$129",["desk","table","gaming_setup"]),
 product("notecraft-journal","camp_007","NoteCraft","NoteCraft Journal","stationery","$14.99",["desk","table","shelf"]),
 product("homeglow-mini","camp_008","HomeGlow","HomeGlow Mini Lamp","home_decor","$39.99",["side_table","desk","shelf"]),
 product("chillsip-bottle","camp_009","ChillSip","ChillSip Bottle","beverage","$24.99",["desk","table","kitchen_counter"]),
 product("spicebite-crisps","camp_010","SpiceBite","SpiceBite Crisps","snack","$4.49",["coffee_table","kitchen_table","kitchen_counter"]),
)
BY_CAMPAIGN={item.campaign_id:item for item in PRODUCTS};BY_ID={item.product_id:item for item in PRODUCTS}
def get_product_asset(campaign_id:str)->ProductAsset|None:
    item=BY_CAMPAIGN.get(campaign_id)
    return item if item and item.asset_path.is_file() else None
def get_product(campaign_id:str)->ProductAsset|None:return BY_CAMPAIGN.get(campaign_id)
def get_product_by_id(product_id:str)->ProductAsset|None:return BY_ID.get(product_id)
def list_products()->tuple[ProductAsset,...]:return PRODUCTS
