// General API Response Structure
export interface ApiResponse<T> {
    message: string
    data: T
}

// --- Auth Types ---
export type UserRole = "customer" | "transporter" | "admin"
export type UserStatus = "active" | "inactive" | "pending"

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    status: UserStatus
}

export interface AuthResponseData {
    user: User
    token: string
}

export type AuthResponse = ApiResponse<AuthResponseData>

export interface RegisterDto {
    name: string
    email: string
    password?: string // Password might be optional if using social login, but typically required for email/password
    role: UserRole
}

export interface LoginDto {
    email: string
    password?: string
}

// --- User Types ---
export interface UpdateUserStatusDto {
    status: UserStatus
}

// --- Shipment Types ---
export interface CreateShipmentDto {
    originAddress: string
    destinationAddress: string
    weight: number
    itemDescription: string
    specialInstructions?: string
    preferredPickupDate?: string // ISO 8601 string
}

export interface ApproveQuoteDto {
    approved: boolean
}

export interface UploadPodDto {
    photoUrl: string
    notes?: string
    recipientName: string
    recipientSignature?: string
    deliveryLatitude?: number
    deliveryLongitude?: number
}

export enum QuoteStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}
// export type ShipmentStatus = "pending" | "approved" | "in-transit" | "delivered" | "cancelled"

export interface Shipment {
    id: string
    originAddress: string
    destinationAddress: string
    weight: number
    itemDescription: string
    specialInstructions?: string
    preferredPickupDate?: string
    status: ShipmentStatus
    createdAt: string
    updatedAt: string
    // Add other fields as per your backend model
}

// --- Pricing Types ---
export interface PricingRule {
    id: string
    name: string
    minWeight: string // Use string for Decimal/BigInt from DB
    maxWeight: string // Use string for Decimal/BigInt from DB
    fuelConsumptionPerKm: string
    baseRatePerKm: string
    fuelPricePerLitre: string
    platformMargin: string
    transporterPayoutPercentage: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export type PricingRulesResponse = ApiResponse<PricingRule[]>

export interface CreatePricingRuleDto {
    name: string
    minWeight: number
    maxWeight: number
    fuelConsumptionPerKm: number
    baseRatePerKm: number
    fuelPricePerLitre: number
    platformMargin: number
    transporterPayoutPercentage: number
    isActive: boolean
}

export interface UpdatePricingRuleDto extends Partial<CreatePricingRuleDto> {}

// --- Transporter Types ---
export type TransporterStatus = "available" | "unavailable" | "on-duty"

export interface TransporterProfile {
    id: string
    userId: string
    companyName: string
    contactPerson: string
    phoneNumber: string
    address: string
    status: TransporterStatus
    credibilityScore: number
    // ... other transporter specific fields
}

export interface UpdateTransporterStatusDto {
    status: TransporterStatus
}

// --- Fleet Types ---
export type VehicleType = "truck" | "van" | "motorcycle"
export type VehicleStatus = "available" | "in-maintenance" | "assigned"

export interface Vehicle {
    id: string
    transporterId: string
    registrationNumber: string
    make: string
    model: string
    year: number
    type: VehicleType
    tonnage: string // Use string for Decimal/BigInt
    fuelConsumptionPerKm: string
    baseRatePerKm: string
    status: VehicleStatus
    lastMaintenanceDate: string | null
    nextMaintenanceDate: string | null
    insuranceNumber: string
    insuranceExpiryDate: string
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export type VehiclesResponse = ApiResponse<Vehicle[]>

export interface CreateFleetDto {
    transporterId: string
    registrationNumber: string
    make: string
    model: string
    year: number
    type: VehicleType
    tonnage: number
    fuelConsumptionPerKm: number
    baseRatePerKm: number
    insuranceNumber: string
    insuranceExpiryDate: string // ISO 8601 string
}

export interface UpdateFleetDto extends Partial<CreateFleetDto> {
    status?: VehicleStatus
    lastMaintenanceDate?: string
    nextMaintenanceDate?: string
}

// --- Tracking Types ---
export interface RouteStep {
    instruction: string
    distance: number
}

export interface RoutePlanData {
    distance: number
    duration: number
    steps: RouteStep[]
    optimizedRoute: boolean
    fuelSavings: string
    timeSavings: string
}

export type RoutePlanResponse = ApiResponse<RoutePlanData>

export interface PlanRouteDto {
    origin: string
    destination: string
    vehicleType?: VehicleType
    weight?: number
}

// --- Admin Types ---
export interface AdminDashboardData {
    totalUsers: number
    activeShipments: number
    pendingApprovals: number
    // ... other dashboard metrics
}

export interface AdminAnalyticsData {
    shipmentVolume: { date: string; count: number }[]
    revenueTrends: { date: string; amount: number }[]
    // ... other analytics data
}


export interface PricingRule {
    id: string
    name: string // e.g., "1T", "3T", "Test Weight Category"
    minWeight: number
    maxWeight: number
    fuelConsumptionPerKm: number
    baseRatePerKm: number
    fuelPricePerLitre: number // This is treated as a global setting in the UI, but part of the DTO
    platformMargin: number
    transporterPayoutPercentage: number
    isActive: boolean
}

export interface CreatePricingRuleDto {
    name: string
    minWeight: number
    maxWeight: number
    fuelConsumptionPerKm: number
    baseRatePerKm: number
    fuelPricePerLitre?: number // Optional, will use global if not provided
    platformMargin?: number
    transporterPayoutPercentage?: number
    isActive?: boolean
}

export interface UpdatePricingRuleDto {
    name?: string
    minWeight?: number
    maxWeight?: number
    fuelConsumptionPerKm?: number
    baseRatePerKm?: number
    fuelPricePerLitre?: number
    platformMargin?: number
    transporterPayoutPercentage?: number
    isActive?: boolean
}

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}
export enum ShipmentStatus {
    PENDING = "pending",
    QUOTE_GENERATED = "quote_generated",
    QUOTE_APPROVED = "quote_approved",
    TRANSPORTER_ASSIGNED = "transporter_assigned",
    PICKUP_SCHEDULED = "pickup_scheduled",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}


export interface ShipmentCreationResponseData {
    shipment: {
        id: string
        customerId: string | null
        trackingNumber: string
        originAddress: string
        destinationAddress: string
        weight: number // Changed to number
        itemDescription: string
        specialInstructions: string | null
        distanceKm: number // Changed to number
        customerPrice: number // Changed to number
        platformFee: number // Changed to number
        status: ShipmentStatus // Use enum
        pickupDate: string | null
        updatedAt: string
        createdAt: string
        transporterId: string | null
        vehicleId: string | null
        transporterPayout: number | null // Changed to number
        deliveryDate: string | null
        estimatedDeliveryDate: string | null
        routeData: any | null
        deletedAt: string | null
    }
    estimatedPrice: number
    breakdown: {
        fuelCost: number
        baseRateCost: number
        totalTransportCost: number
        margin: number
    }
}
