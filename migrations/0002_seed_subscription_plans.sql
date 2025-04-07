INSERT INTO subscription_plans (name, stripe_price_id, price, max_monthly_generations, max_image_width, max_image_height, queue_priority, features)
VALUES 
  ('FREE', 'free', 0, 10, 512, 512, 0, '{"standardGPU":true,"standardQueue":true,"basicQRIntegration":true}'),
  ('BASIC', 'price_1R0IC5FQBFx9IphFjKf7UL5b', 999, 50, 1024, 1024, 1, '{"enhancedGPU":true,"priorityQueue":true,"premiumTemplates":5,"multipleExportFormats":true,"basicAnalytics":true,"emailSupport":true}'),
  ('PREMIUM', 'price_1R0ICzFQBFx9IphFYbQMTegf', 1999, 200, 2048, 2048, 2, '{"advancedGPU":true,"highestPriority":true,"advancedQRCustomization":true,"batchProcessing":true,"comprehensiveAnalytics":true,"apiAccess":true,"prioritySupport":true}')
ON CONFLICT (name) DO UPDATE SET
  stripe_price_id = EXCLUDED.stripe_price_id,
  price = EXCLUDED.price,
  max_monthly_generations = EXCLUDED.max_monthly_generations,
  max_image_width = EXCLUDED.max_image_width,
  max_image_height = EXCLUDED.max_image_height,
  queue_priority = EXCLUDED.queue_priority,
  features = EXCLUDED.features;
