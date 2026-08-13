-- Development-only fictional campaign expansion for the shoppable placement MVP.
-- Execute in the verified ClickHouse Cloud environment; all brands/products are fictional.
INSERT INTO adless.campaign_performance
(campaign_id,brand,product_name,category,market,scene_environment,placement_surface,impressions,avg_exposure_seconds,success_rate,performance_score)
VALUES
('camp_003','BeanBox','BeanBox Roast','coffee','US','office','desk',8200,5.6,0.81,8.2),
('camp_004','PageNest','The Modern Developer','book','US','living_room','coffee_table',6100,5.1,0.73,7.4),
('camp_005','VoltBook','VoltBook Air','electronics','US','office','desk',9400,6.4,0.84,8.5),
('camp_006','SoundPod','SoundPod Studio','electronics','US','gaming_room','desk',7600,5.9,0.79,8.0),
('camp_007','NoteCraft','NoteCraft Journal','stationery','US','office','desk',5200,4.8,0.71,7.1),
('camp_008','HomeGlow','HomeGlow Mini Lamp','home_decor','US','living_room','side_table',6800,6.0,0.78,7.9),
('camp_009','ChillSip','ChillSip Bottle','beverage','US','office','desk',8900,5.7,0.82,8.3),
('camp_010','SpiceBite','SpiceBite Crisps','snack','US','kitchen','kitchen_counter',7300,5.3,0.77,7.8);
