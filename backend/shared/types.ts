/**
 * Skyie Marketing OS - TypeScript Type Definitions
 * Generated from JSON Schema specifications
 * Version: 1.0.0
 */

// =============================================================================
// BRAND GENOME TYPES
// =============================================================================

export interface BrandGenome {
  $schema: string;
  id: string;
  version: Version;
  identity: BrandIdentity;
  visual_identity: VisualIdentity;
  verbal_identity: VerbalIdentity;
  compliance?: ComplianceConfig;
  audience?: AudienceConfig;
  content_strategy?: ContentStrategy;
  platform_rules?: PlatformRules;
  metadata?: GenomeMetadata;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
  hash: string;
  created_at: string;
  created_by: string;
  parent_version?: string | null;
  change_summary?: string;
}

export interface BrandIdentity {
  name: string;
  legal_name?: string;
  tagline?: string;
  mission_statement?: string;
  vision_statement?: string;
  value_propositions?: string[];
  brand_values?: string[];
  brand_personality?: BrandPersonality;
  founded_year?: number;
  headquarters?: string;
  website?: string;
}

export interface BrandPersonality {
  archetypes?: BrandArchetype[];
  traits?: string[];
  tone_descriptors?: string[];
}

export type BrandArchetype =
  | 'Innocent'
  | 'Explorer'
  | 'Sage'
  | 'Hero'
  | 'Outlaw'
  | 'Magician'
  | 'Regular Guy'
  | 'Lover'
  | 'Jester'
  | 'Caregiver'
  | 'Creator'
  | 'Ruler';

// =============================================================================
// VISUAL IDENTITY TYPES
// =============================================================================

export interface VisualIdentity {
  logo?: LogoSystem;
  colors: ColorSystem;
  typography: TypographySystem;
  spacing?: SpacingSystem;
  imagery?: ImageryGuidelines;
  motion?: MotionGuidelines;
}

export interface LogoSystem {
  primary?: LogoVariant;
  variants?: LogoVariant[];
  usage_rules?: string[];
  prohibited_uses?: string[];
}

export interface LogoVariant {
  variant_type?: LogoVariantType;
  url: string;
  format: 'svg' | 'png' | 'eps' | 'pdf';
  min_size_px?: number;
  clear_space_ratio?: number;
  use_when?: string[];
  background_colors?: HexColor[];
}

export type LogoVariantType =
  | 'primary'
  | 'mono'
  | 'mono_reversed'
  | 'icon'
  | 'horizontal'
  | 'vertical'
  | 'favicon';

export interface ColorSystem {
  primary: BrandColor;
  secondary?: BrandColor[];
  accent?: BrandColor[];
  neutral?: NeutralPalette;
  semantic?: SemanticColors;
  gradient_rules?: GradientRules;
}

export interface BrandColor {
  name?: string;
  hex: HexColor;
  rgb?: RGBColor;
  hsl?: HSLColor;
  cmyk?: CMYKColor;
  pantone?: string;
  semantic_meaning?: string;
  usage?: string[];
  prohibited_usage?: string[];
  accessibility?: ColorAccessibility;
}

export type HexColor = `#${string}`;

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorAccessibility {
  wcag_aa_on_white?: boolean;
  wcag_aaa_on_white?: boolean;
  wcag_aa_on_black?: boolean;
  wcag_aaa_on_black?: boolean;
  contrast_ratio_on_white?: number;
  contrast_ratio_on_black?: number;
  safe_text_colors?: HexColor[];
}

export interface NeutralPalette {
  background?: HexColor;
  surface?: HexColor;
  surface_variant?: HexColor;
  text_primary?: HexColor;
  text_secondary?: HexColor;
  text_disabled?: HexColor;
  border?: HexColor;
  divider?: HexColor;
}

export interface SemanticColors {
  success?: HexColor;
  warning?: HexColor;
  error?: HexColor;
  info?: HexColor;
}

export interface GradientRules {
  allowed?: boolean;
  approved_gradients?: Gradient[];
  prohibited_combinations?: HexColor[][];
}

export interface Gradient {
  name?: string;
  type: 'linear' | 'radial';
  direction?: string;
  stops: GradientStop[];
}

export interface GradientStop {
  color: HexColor;
  position: number;
}

export interface TypographySystem {
  primary_font: FontDefinition;
  secondary_font?: FontDefinition;
  monospace_font?: FontDefinition;
  hierarchy: TypeHierarchy;
}

export interface FontDefinition {
  family: string;
  fallback?: string[];
  weights_available?: FontWeight[];
  source?: 'google_fonts' | 'adobe_fonts' | 'custom' | 'system';
  license?: string;
  url?: string;
}

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface TypeHierarchy {
  display?: TypeStyle;
  h1?: TypeStyle;
  h2?: TypeStyle;
  h3?: TypeStyle;
  h4?: TypeStyle;
  h5?: TypeStyle;
  h6?: TypeStyle;
  body?: TypeStyle;
  body_large?: TypeStyle;
  body_small?: TypeStyle;
  caption?: TypeStyle;
  overline?: TypeStyle;
  button?: TypeStyle;
}

export interface TypeStyle {
  font_family?: 'primary' | 'secondary' | 'monospace';
  size_px?: number;
  size_rem?: number;
  weight?: FontWeight;
  line_height?: number;
  letter_spacing?: string;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface SpacingSystem {
  base_unit?: number;
  scale?: number[];
  grid_columns?: number;
  gutter_px?: number;
  max_content_width_px?: number;
}

export interface ImageryGuidelines {
  photography_style?: PhotographyStyle;
  illustration_style?: IllustrationStyle;
  icon_style?: IconStyle;
}

export interface PhotographyStyle {
  subjects?: string[];
  mood?: string[];
  lighting?: string;
  color_treatment?: string;
  composition_rules?: string[];
  prohibited?: string[];
  filters_presets?: string[];
}

export interface IllustrationStyle {
  enabled?: boolean;
  style?: string;
  line_weight?: string;
  allowed_colors?: string;
  prohibited?: string[];
}

export interface IconStyle {
  style?: 'outline' | 'filled' | 'duotone' | 'custom';
  stroke_width?: number;
  corner_radius?: number;
  grid_size?: number;
}

export interface MotionGuidelines {
  enabled?: boolean;
  easing?: string;
  duration_scale?: DurationScale;
  enter_animation?: string;
  exit_animation?: string;
  prohibited?: string[];
}

export interface DurationScale {
  instant?: string;
  fast?: string;
  normal?: string;
  slow?: string;
}

// =============================================================================
// VERBAL IDENTITY TYPES
// =============================================================================

export interface VerbalIdentity {
  voice: VoiceParameters;
  tone_contexts?: ToneContext[];
  writing_rules?: WritingRules;
  vocabulary?: VocabularyRules;
  messaging?: MessagingFramework;
}

export interface VoiceParameters {
  formality?: number;
  technical_level?: number;
  warmth?: number;
  confidence?: number;
  humor?: number;
  urgency?: number;
}

export interface ToneContext {
  context: ToneContextType;
  adjustments: Partial<VoiceParameters>;
  examples?: string[];
}

export type ToneContextType =
  | 'marketing'
  | 'sales'
  | 'support'
  | 'crisis'
  | 'legal'
  | 'social'
  | 'email'
  | 'formal_comms';

export interface WritingRules {
  sentence_length?: LengthRule;
  paragraph_length?: LengthRule;
  reading_level?: ReadingLevelRule;
  active_voice_ratio?: number;
  contractions?: 'always' | 'sometimes' | 'never';
  oxford_comma?: boolean;
  date_format?: string;
  number_style?: NumberStyle;
}

export interface LengthRule {
  target?: number;
  max?: number;
}

export interface ReadingLevelRule {
  flesch_kincaid_target?: number;
  flesch_kincaid_max?: number;
}

export interface NumberStyle {
  spell_below?: number;
  thousands_separator?: string;
  decimal_separator?: string;
}

export interface VocabularyRules {
  preferred?: string[];
  avoid?: string[];
  banned?: string[];
  replacements?: WordReplacement[];
  industry_jargon_policy?: 'avoid' | 'use_sparingly_with_explanation' | 'use_freely';
}

export interface WordReplacement {
  from: string;
  to: string;
}

export interface MessagingFramework {
  taglines?: string[];
  elevator_pitch_30s?: string;
  elevator_pitch_60s?: string;
  boilerplate?: string;
  value_props?: ValueProp[];
  key_messages?: string[];
}

export interface ValueProp {
  headline?: string;
  description?: string;
  proof_points?: string[];
}

// =============================================================================
// COMPLIANCE TYPES
// =============================================================================

export interface ComplianceConfig {
  enabled?: boolean;
  jurisdictions?: Jurisdiction[];
  industry_regulations?: IndustryRegulation[];
  rules?: ComplianceRule[];
  disclaimers?: Disclaimer[];
  prohibited_claims?: string[];
  required_disclosures?: string[];
  approval_workflow?: ApprovalWorkflow;
}

export type Jurisdiction = 'UK' | 'EU' | 'US' | 'US_CA' | 'US_NY' | 'AU' | 'SG' | 'AE';

export type IndustryRegulation =
  | 'FCA'
  | 'SEC'
  | 'FINRA'
  | 'HIPAA'
  | 'FDA'
  | 'ASA'
  | 'GDPR'
  | 'CCPA';

export interface ComplianceRule {
  rule_id: string;
  regulation?: string;
  description: string;
  trigger_conditions?: string[];
  enforcement: 'block' | 'warn' | 'log';
  required_elements?: string[];
  prohibited_elements?: string[];
}

export interface Disclaimer {
  disclaimer_id: string;
  text: string;
  text_variants?: Record<string, string>;
  trigger_conditions: string[];
  placement?: DisclaimerPlacement;
  styling?: DisclaimerStyling;
}

export type DisclaimerPlacement =
  | 'above_content'
  | 'below_content'
  | 'below_cta'
  | 'footer'
  | 'inline';

export interface DisclaimerStyling {
  min_font_ratio?: number;
  contrast_required?: boolean;
  prominent?: boolean;
}

export interface ApprovalWorkflow {
  required_for?: string[];
  approver_roles?: string[];
  max_approval_time_hours?: number;
  escalation_after_hours?: number;
  auto_reject_after_hours?: number;
}

// =============================================================================
// AUDIENCE TYPES
// =============================================================================

export interface AudienceConfig {
  personas?: Persona[];
  anti_personas?: AntiPersona[];
}

export interface Persona {
  persona_id: string;
  name: string;
  demographics?: PersonaDemographics;
  psychographics?: PersonaPsychographics;
  content_preferences?: ContentPreferences;
}

export interface PersonaDemographics {
  age_range?: [number, number];
  gender?: string;
  job_titles?: string[];
  company_size?: string[];
  industries?: string[];
  locations?: string[];
}

export interface PersonaPsychographics {
  goals?: string[];
  pain_points?: string[];
  motivations?: string[];
  objections?: string[];
}

export interface ContentPreferences {
  formats?: string[];
  channels?: string[];
  tone_preference?: string;
  content_length?: 'snackable' | 'medium' | 'long_form';
}

export interface AntiPersona {
  description: string;
  exclusion_reason: string;
  signals?: string[];
}

// =============================================================================
// CONTENT STRATEGY TYPES
// =============================================================================

export interface ContentStrategy {
  pillars?: ContentPillar[];
  forbidden_zones?: string[];
  content_types?: Record<string, ContentTypeRules>;
}

export interface ContentPillar {
  pillar_id: string;
  name: string;
  description?: string;
  content_ratio?: number;
  themes?: string[];
}

export interface ContentTypeRules {
  min_words?: number;
  max_words?: number;
  min_chars?: number;
  max_chars?: number;
  required_elements?: string[];
  optional_elements?: string[];
  hashtags?: HashtagRules;
}

export interface HashtagRules {
  min?: number;
  max?: number;
}

// =============================================================================
// PLATFORM RULES TYPES
// =============================================================================

export type PlatformRules = Record<string, PlatformConfig>;

export interface PlatformConfig {
  enabled?: boolean;
  posting_frequency?: PostingFrequency;
  optimal_times_utc?: string[];
  content_mix?: Record<string, number>;
  hashtag_strategy?: PlatformHashtagStrategy;
  handle?: string;
  bio?: string;
}

export interface PostingFrequency {
  min_per_week?: number;
  max_per_week?: number;
  min_per_day?: number;
  max_per_day?: number;
}

export interface PlatformHashtagStrategy {
  max?: number;
  recommended?: number;
  branded?: string[];
}

// =============================================================================
// METADATA TYPES
// =============================================================================

export interface GenomeMetadata {
  created_at?: string;
  last_modified?: string;
  extraction_sources?: ExtractionSource[];
  human_confirmed_fields?: string[];
  requires_confirmation?: string[];
}

export interface ExtractionSource {
  source_type: 'website' | 'pdf' | 'image' | 'social_account' | 'api' | 'manual';
  url?: string;
  filename?: string;
  extracted_at?: string;
  confidence?: number;
  fields_extracted?: string[];
}

// =============================================================================
// CAMPAIGN BLUEPRINT TYPES
// =============================================================================

export interface CampaignBlueprint {
  $schema: string;
  id: string;
  metadata: CampaignMetadata;
  brand_genome_ref: string;
  objective: CampaignObjective;
  timing: CampaignTiming;
  target_audience?: TargetAudience;
  messaging?: CampaignMessaging;
  channel_strategy: ChannelStrategy;
  content_plan?: ContentPlan;
  budget?: CampaignBudget;
  success_metrics?: SuccessMetrics;
  compliance_overrides?: ComplianceOverrides;
}

export interface CampaignMetadata {
  name: string;
  description?: string;
  status: CampaignStatus;
  created_at: string;
  created_by: string;
  last_modified?: string;
  modified_by?: string;
  tags?: string[];
  external_id?: string;
  priority?: number;
}

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'cancelled';

export interface CampaignObjective {
  type: ObjectiveType;
  description?: string;
  primary_kpi: KPI;
  secondary_kpis?: KPI[];
  success_threshold?: number;
}

export type ObjectiveType =
  | 'awareness'
  | 'consideration'
  | 'conversion'
  | 'retention'
  | 'advocacy'
  | 'engagement';

export interface KPI {
  metric: MetricType;
  custom_metric_name?: string;
  target: number;
  unit?: string;
  timeframe_days?: number;
  baseline?: number;
}

export type MetricType =
  | 'impressions'
  | 'reach'
  | 'views'
  | 'video_views'
  | 'clicks'
  | 'website_visits'
  | 'page_views'
  | 'time_on_site'
  | 'engagements'
  | 'engagement_rate'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'saves'
  | 'leads'
  | 'signups'
  | 'registrations'
  | 'downloads'
  | 'conversions'
  | 'purchases'
  | 'revenue'
  | 'roas'
  | 'aov'
  | 'ctr'
  | 'cpc'
  | 'cpm'
  | 'cpa'
  | 'cpl'
  | 'followers'
  | 'subscriber_growth'
  | 'nps'
  | 'csat'
  | 'retention_rate'
  | 'custom';

export interface CampaignTiming {
  type: 'finite' | 'perpetual' | 'recurring';
  start_date?: string;
  end_date?: string;
  timezone?: string;
  phases?: CampaignPhase[];
  recurrence?: RecurrenceRule;
  blackout_dates?: string[];
  key_dates?: KeyDate[];
}

export interface CampaignPhase {
  phase_id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  start_offset_days?: number;
  end_offset_days?: number;
  content_strategy?: string;
  channel_weights?: Record<string, number>;
  budget_allocation?: number;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval?: number;
  days_of_week?: DayOfWeek[];
  week_of_month?: number;
  day_of_month?: number;
  end_after_occurrences?: number;
  end_by_date?: string;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface KeyDate {
  date: string;
  description: string;
  content_focus?: string;
}

export interface TargetAudience {
  primary_persona_refs?: string[];
  audience_overrides?: AudienceOverrides;
  platform_targeting?: Record<string, PlatformTargeting>;
  exclusions?: AudienceExclusions;
}

export interface AudienceOverrides {
  age_range?: [number, number];
  gender?: string[];
  geo_targets?: string[];
  languages?: string[];
  interests?: string[];
  behaviors?: string[];
}

export interface PlatformTargeting {
  job_titles?: string[];
  job_functions?: string[];
  seniority?: string[];
  industries?: string[];
  company_size?: string[];
  custom_audiences?: string[];
  lookalike_sources?: string[];
}

export interface AudienceExclusions {
  segments?: string[];
  previous_converters?: boolean;
  existing_customers?: boolean;
  competitor_employees?: boolean;
}

export interface CampaignMessaging {
  key_message?: string;
  supporting_messages?: string[];
  emotional_angle?: string;
  rational_angle?: string;
  hook_frameworks?: HookFramework[];
  cta_primary?: CallToAction;
  cta_secondary?: CallToAction;
  offer?: Offer;
  hashtags?: CampaignHashtags;
}

export type HookFramework =
  | 'pain_agitate_solve'
  | 'before_after_bridge'
  | 'problem_solution'
  | 'social_proof_lead'
  | 'curiosity_gap'
  | 'contrarian'
  | 'story_arc'
  | 'question_lead'
  | 'statistic_lead'
  | 'how_to';

export interface CallToAction {
  text: string;
  url: string;
  utm_parameters?: UTMParameters;
}

export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface Offer {
  type?: OfferType;
  description?: string;
  value?: string;
  code?: string;
  valid_from?: string;
  valid_until?: string;
  terms?: string;
}

export type OfferType =
  | 'discount'
  | 'free_trial'
  | 'free_shipping'
  | 'bonus'
  | 'limited_time'
  | 'exclusive'
  | 'bundle';

export interface CampaignHashtags {
  campaign_specific?: string[];
  always_include?: string[];
}

export interface ChannelStrategy {
  channels: ChannelConfig[];
  orchestration_mode?: 'independent' | 'synchronized' | 'sequential';
}

export interface ChannelConfig {
  channel: ChannelType;
  role: 'primary' | 'secondary' | 'supporting' | 'experimental';
  content_types?: string[];
  frequency?: ChannelFrequency;
  budget_allocation?: number;
  goals?: KPI[];
  creative_specifications?: Record<string, unknown>;
}

export type ChannelType =
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'google_ads'
  | 'meta_ads'
  | 'linkedin_ads'
  | 'tiktok_ads'
  | 'blog'
  | 'website'
  | 'landing_page'
  | 'podcast'
  | 'webinar'
  | 'pr';

export interface ChannelFrequency {
  posts_per_day?: number;
  posts_per_week?: number;
  emails_per_week?: number;
  ads_always_on?: boolean;
}

export interface ContentPlan {
  content_calendar?: ScheduledContent[];
  auto_generation_rules?: AutoGenerationRules;
  content_themes?: ContentTheme[];
}

export interface ScheduledContent {
  content_id: string;
  type: string;
  channel?: string;
  scheduled_date: string;
  phase?: string;
  brief?: string;
  status?: ContentStatus;
  asset_ref?: string;
}

export type ContentStatus =
  | 'planned'
  | 'generating'
  | 'generated'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

export interface AutoGenerationRules {
  enabled?: boolean;
  generate_ahead_days?: number;
  require_approval?: boolean;
  variation_count?: number;
  regeneration_trigger?: 'manual' | 'on_rejection' | 'on_performance_drop' | 'scheduled';
  content_sources?: ContentSource[];
}

export type ContentSource =
  | 'brand_genome'
  | 'campaign_brief'
  | 'top_performers'
  | 'competitor_analysis'
  | 'trending_topics';

export interface ContentTheme {
  theme: string;
  weight: number;
  content_types?: string[];
}

export interface CampaignBudget {
  total?: MoneyAmount;
  breakdown?: Record<string, number>;
  daily_limit?: MoneyAmount;
  pacing?: 'standard' | 'accelerated' | 'custom';
  auto_optimize?: boolean;
}

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export interface SuccessMetrics {
  reporting_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  dashboards?: string[];
  alerts?: MetricAlert[];
  attribution_model?: AttributionModel;
  tracking_pixels?: TrackingPixel[];
}

export interface MetricAlert {
  metric: string;
  condition: 'exceeds' | 'falls_below' | 'changes_by';
  threshold: number;
  threshold_unit?: 'absolute' | 'percentage';
  action?: 'notify' | 'pause' | 'adjust_budget' | 'escalate';
  notify_channels?: NotifyChannel[];
}

export type NotifyChannel = 'email' | 'slack' | 'sms' | 'in_app';

export type AttributionModel =
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'time_decay'
  | 'position_based'
  | 'data_driven';

export interface TrackingPixel {
  platform: string;
  pixel_id: string;
  events?: string[];
}

export interface ComplianceOverrides {
  additional_rules?: AdditionalRule[];
  disabled_rules?: DisabledRule[];
  additional_disclaimers?: string[];
  approval_overrides?: ApprovalOverrides;
}

export interface AdditionalRule {
  rule_id: string;
  reason: string;
}

export interface DisabledRule {
  rule_id: string;
  reason: string;
  approved_by: string;
  approved_at: string;
}

export interface ApprovalOverrides {
  skip_for?: string[];
  require_for?: string[];
}

// =============================================================================
// ASSET TYPES
// =============================================================================

export interface Asset {
  id: string;
  metadata: AssetMetadata;
  lineage: AssetLineage;
  content: AssetContent;
  compliance_state: AssetComplianceState;
  publication_state: AssetPublicationState;
  performance?: AssetPerformance;
  audit_trail: AuditEntry[];
}

export interface AssetMetadata {
  created_at: string;
  created_by: string;
  generation_method: 'ai_generated' | 'human_created' | 'hybrid';
  version: number;
}

export interface AssetLineage {
  brand_genome_ref: string;
  brand_genome_hash: string;
  campaign_ref?: string;
  parent_asset_ref?: string;
  generation_prompt_hash?: string;
  ai_model?: AIModelInfo;
  input_sources?: string[];
}

export interface AIModelInfo {
  provider: string;
  model: string;
  temperature?: number;
  timestamp?: string;
}

export interface AssetContent {
  type: string;
  format: string;
  primary_text?: string;
  headline?: string;
  cta_text?: string;
  cta_url?: string;
  media_refs?: string[];
  hashtags?: string[];
  character_count?: number;
  word_count?: number;
}

export interface AssetComplianceState {
  status: 'pending' | 'approved' | 'rejected' | 'requires_revision';
  violations: Violation[];
  warnings: Warning[];
  approvals: Approval[];
  compliance_score?: number;
}

export interface Violation {
  rule_id: string;
  severity: 'error' | 'critical';
  message: string;
  field?: string;
  value?: string;
  suggested_fix?: SuggestedFix;
}

export interface Warning {
  rule_id: string;
  message: string;
  field?: string;
}

export interface SuggestedFix {
  type: string;
  value?: string | Record<string, unknown>;
  guidance?: string;
}

export interface Approval {
  approval_type: string;
  approved_by: string;
  approved_at: string;
  notes?: string;
}

export interface AssetPublicationState {
  status: 'draft' | 'scheduled' | 'published' | 'unpublished' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  published_to?: PublicationRecord[];
}

export interface PublicationRecord {
  platform: string;
  platform_post_id?: string;
  url?: string;
  published_at?: string;
}

export interface AssetPerformance {
  impressions?: number;
  engagements?: number;
  clicks?: number;
  conversions?: number;
  engagement_rate?: number;
  click_rate?: number;
  conversion_rate?: number;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  score?: number;
  violations: Violation[];
  warnings: Warning[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  type: string;
  message: string;
  suggested_value?: string;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  next_page_token?: string;
  total_count?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ExtractionJob {
  job_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  estimated_completion?: string;
  result?: Partial<BrandGenome>;
  errors?: string[];
}

export interface PublicationJob {
  job_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  platforms: PlatformPublicationStatus[];
}

export interface PlatformPublicationStatus {
  platform: string;
  status: 'pending' | 'published' | 'failed';
  post_id?: string;
  url?: string;
  error?: string;
}
