-- Commit new enum values before the subsequent migration uses them as defaults.
ALTER TYPE "BookingStatus" ADD VALUE 'REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE 'PAID';
ALTER TYPE "BookingStatus" ADD VALUE 'PICKUP_INSPECTION';
ALTER TYPE "BookingStatus" ADD VALUE 'RETURN_INSPECTION';
ALTER TYPE "BookingStatus" ADD VALUE 'DISPUTED';
ALTER TYPE "BookingStatus" ADD VALUE 'REJECTED';
