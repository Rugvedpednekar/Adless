import asyncio
from fastapi import APIRouter,Depends
from app.schemas.placement_analytics import PlacementAnalyticsSummary,PlacementEvent,PlacementEventAccepted
from app.services.placement_analytics_service import PlacementAnalyticsError,PlacementAnalyticsService
router=APIRouter(prefix="/analytics",tags=["Analytics"])
def get_service():return PlacementAnalyticsService()
@router.post("/placement-events",response_model=PlacementEventAccepted)
async def record_event(event:PlacementEvent,service:PlacementAnalyticsService=Depends(get_service)):
 try:await asyncio.to_thread(service.record,event);return PlacementEventAccepted(accepted=True)
 except PlacementAnalyticsError:return PlacementEventAccepted(accepted=False)
@router.get("/placement-events/summary",response_model=PlacementAnalyticsSummary)
async def summary(service:PlacementAnalyticsService=Depends(get_service)):
 try:return await asyncio.to_thread(service.summary)
 except PlacementAnalyticsError:return PlacementAnalyticsSummary()
