-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipBoostSetting" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "template" TEXT NOT NULL DEFAULT 'modern',
    "goalAmount" TEXT NOT NULL DEFAULT '50.00',
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "barColor" TEXT NOT NULL DEFAULT '#2E7D32',
    "backgroundColor" TEXT NOT NULL DEFAULT '#E8F5E9',
    "successColor" TEXT NOT NULL DEFAULT '#1B5E20',
    "remainingMessage" TEXT NOT NULL DEFAULT 'Spend {{remaining}} more to unlock FREE SHIPPING.',
    "successMessage" TEXT NOT NULL DEFAULT '🎉 Congratulations! You''ve unlocked FREE SHIPPING.',
    "borderRadius" INTEGER NOT NULL DEFAULT 8,
    "barHeight" INTEGER NOT NULL DEFAULT 12,
    "fontFamily" TEXT NOT NULL DEFAULT 'theme',
    "fontSize" INTEGER NOT NULL DEFAULT 12,
    "fontWeight" INTEGER NOT NULL DEFAULT 500,
    "textColor" TEXT NOT NULL DEFAULT '#444444',
    "textAlign" TEXT NOT NULL DEFAULT 'center',
    "displayOn" TEXT NOT NULL DEFAULT 'all',
    "position" TEXT NOT NULL DEFAULT 'below-add-to-cart',
    "enableMobile" BOOLEAN NOT NULL DEFAULT true,
    "enableDesktop" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipBoostSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShipBoostSetting_shop_key" ON "ShipBoostSetting"("shop");

