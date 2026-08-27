/*
  Re-exports from centralized env module.
  This file is kept for backward compatibility.
*/
import {
  getSupabaseUrl as _getSupabaseUrl,
  getSupabasePublishableKey as _getSupabasePublishableKey,
  getSupabaseSecretKey as _getSupabaseSecretKey,
} from "../env";

export const getSupabaseUrl = _getSupabaseUrl;
export const getSupabasePublishableKey = _getSupabasePublishableKey;
export const getSupabaseSecretKey = _getSupabaseSecretKey;