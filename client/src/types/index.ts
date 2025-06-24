import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface State {
  id: number;
  description: string;
}

export interface ClientSummary {
  id: any;
  name: string;
  lastname: string;
  dni: string;
  state?: State;
}

export interface Client extends ClientSummary {
  email: string;
  phone: string;
  address: string;
  sales?: SaleSummary[];
}

export interface SaleSummary {
  id: any;
  description: string;
  is_paid: boolean;
  state: number;
  amount?: number;
  date?: string;
  quotas?: QuotaDetail[];
  products?: SaleProduct[];
  notes?: NoteDetail[];
}

export interface SaleProduct {
  id: any;
  name: string;
  cost: number;
  price: number;
  quantity: number;
}

export interface QuotaDetail {
  id: string;
  number: number;
  amount: number;
  is_paid: boolean;
  state: number;
  due_date?: string;
  payments?: PaymentDetail[];
}

export interface PaymentDetail {
  id: string;
  amount: number;
  date?: string;
}

export interface NoteDetail {
  id: any;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Paginated<T> {
  results: T[];
  count: number;
}

// Product types
export interface Product {
  id: any;
  name: string;
  cost: number;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  total_products: number;
  total_value: number;
  total_cost: number;
  total_stock: number;
  out_of_stock_count: number;
}

// Sale creation types
export interface CreateSaleDto {
  amount: number;
  client_id: number;
  date: string;
  quotas: number;
  quota_price: number;
  products: CreateSaleProductDto[];
}

export interface CreateSaleProductDto {
  id?: number;
  name: string;
  cost: number;
  price: number;
  quantity: number;
}

export interface SaleFormData {
  date: string;
  quotas: number;
  quota_price: string;
  products: SaleFormProduct[];
}

export interface SaleFormProduct {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost: number;
  stock: number;
  is_manual: boolean;
}
