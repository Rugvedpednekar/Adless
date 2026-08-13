from app.schemas.placement_manifest import ManifestPlacement,ManifestProduct,PlacementCTA,PlacementManifest
from app.services.campaign_selection_cache import get_selected_campaign
from app.services.placement_approval_service import is_approved
from app.services.product_catalog import get_product
from app.services.product_placement_service import get_cached_preview

MIN_DURATION=4.0
def build_manifest(video_id,analysis):
    result=[];index=0
    for scene in analysis.scenes:
      for opportunity in scene.placement_opportunities:
        if is_approved(video_id,index):
          campaign=get_selected_campaign(video_id,index);preview=get_cached_preview(video_id,index)
          product=get_product(campaign.campaign_id) if campaign else None
          duration=scene.end_time-scene.start_time
          if campaign and preview and product and duration>=MIN_DURATION:
            show=scene.start_time+1.5;hide=scene.end_time-1.0
            if hide>show:
              result.append(ManifestPlacement(placement_id=f"{video_id}-{index}",placement_index=index,campaign_id=campaign.campaign_id,product_id=product.product_id,start_time=scene.start_time,end_time=scene.end_time,surface=opportunity.surface,scene_environment=scene.environment,placement_confidence=opportunity.confidence,performance_score=campaign.performance_score,product=ManifestProduct(product_id=product.product_id,brand=product.brand,name=product.product_name,category=product.category,price=product.price,image_url=product.thumbnail,landing_path=product.landing_path),cta=PlacementCTA(show_at=show,hide_at=hide)))
        index+=1
    result.sort(key=lambda p:(p.cta.show_at,-p.performance_score,-p.placement_confidence))
    return PlacementManifest(video_id=video_id,playback_url=(f"/api/videos/{video_id}/placements/{result[0].placement_index}/preview/stream" if result else None),placements=result)
