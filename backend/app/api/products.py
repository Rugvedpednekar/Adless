from fastapi import APIRouter,HTTPException
from app.services.product_catalog import get_product_by_id,list_products
router=APIRouter(prefix="/products",tags=["Products"])
def serialize(item):return {"product_id":item.product_id,"brand":item.brand,"product_name":item.product_name,"category":item.category,"price":item.price,"thumbnail":item.thumbnail,"landing_path":item.landing_path,"compatible_surfaces":item.compatible_surfaces,"compatible_environments":item.compatible_environments,"description":f"A fictional {item.category.replace('_',' ')} product created for contextual placement demonstrations."}
@router.get("")
async def products():return [serialize(item) for item in list_products()]
@router.get("/{product_id}")
async def product(product_id:str):
 item=get_product_by_id(product_id)
 if not item:raise HTTPException(status_code=404,detail="Product not found")
 return serialize(item)
