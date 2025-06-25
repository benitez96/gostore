import React from "react";
import { Card, CardBody } from "@heroui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  valueColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  iconColor,
  valueColor,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <CardBody className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className={`p-2 ${iconColor} rounded-full mb-2`}>
            {icon}
          </div>
          <p className="text-sm text-default-600 font-medium">
            {title}
          </p>
          <p className={`text-2xl font-bold ${valueColor || 'text-primary'}`}>
            {value}
          </p>
          {subtitle && (
            <span className="text-xs text-default-500">{subtitle}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export interface LargeStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  valueColor?: string;
  className?: string;
}

export function LargeStatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  iconColor,
  valueColor,
  className = "",
}: LargeStatCardProps) {
  return (
    <Card className={`${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-default-600 font-medium">
              {title}
            </p>
            <p className={`text-3xl font-bold mt-1 text-balance ${valueColor || 'text-primary'}`}>
              {value}
            </p>
            {subtitle && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-default-500">
                  {subtitle}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 ${iconColor} rounded-full`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 