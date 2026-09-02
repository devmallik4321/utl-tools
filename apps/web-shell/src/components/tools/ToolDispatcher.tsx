"use client";

import dynamic from "next/dynamic";
import { UtilityItem } from "@/lib/types";

// Dynamic imports with instant client hydration
const RandomNumberGenerator = dynamic(() => import("./fun/RandomNumberGenerator").then((m) => m.RandomNumberGenerator), { ssr: false });
const SpinWheel = dynamic(() => import("./fun/SpinWheel").then((m) => m.SpinWheel), { ssr: false });
const CoinFlip = dynamic(() => import("./fun/CoinFlip").then((m) => m.CoinFlip), { ssr: false });
const DiceRoller = dynamic(() => import("./fun/DiceRoller").then((m) => m.DiceRoller), { ssr: false });
const RandomPicker = dynamic(() => import("./fun/RandomPicker").then((m) => m.RandomPicker), { ssr: false });
const PasswordGenerator = dynamic(() => import("./fun/PasswordGenerator").then((m) => m.PasswordGenerator), { ssr: false });
const UsernameGenerator = dynamic(() => import("./fun/UsernameGenerator").then((m) => m.UsernameGenerator), { ssr: false });
const TalkingAlarmClock = dynamic(() => import("./fun/TalkingAlarmClock").then((m) => m.TalkingAlarmClock), { ssr: false });
const StopwatchTimer = dynamic(() => import("./fun/StopwatchTimer").then((m) => m.StopwatchTimer), { ssr: false });
const MorseCodeTranslator = dynamic(() => import("./fun/MorseCodeTranslator").then((m) => m.MorseCodeTranslator), { ssr: false });

const MyIp = dynamic(() => import("./network/MyIp").then((m) => m.MyIp), { ssr: false });
const BrowserInfo = dynamic(() => import("./network/BrowserInfo").then((m) => m.BrowserInfo), { ssr: false });
const ScreenResolution = dynamic(() => import("./network/ScreenResolution").then((m) => m.ScreenResolution), { ssr: false });
const PingTest = dynamic(() => import("./network/PingTest").then((m) => m.PingTest), { ssr: false });
const DnsLookup = dynamic(() => import("./network/DnsLookup").then((m) => m.DnsLookup), { ssr: false });
const UserAgentChecker = dynamic(() => import("./network/UserAgentChecker").then((m) => m.UserAgentChecker), { ssr: false });
const BandwidthCalculator = dynamic(() => import("./network/BandwidthCalculator").then((m) => m.BandwidthCalculator), { ssr: false });
const NetworkPortReference = dynamic(() => import("./network/NetworkPortReference").then((m) => m.NetworkPortReference), { ssr: false });
const SubnetCalculator = dynamic(() => import("./network/SubnetCalculator").then((m) => m.SubnetCalculator), { ssr: false });
const IpGeolocationLookup = dynamic(() => import("./network/IpGeolocationLookup").then((m) => m.IpGeolocationLookup), { ssr: false });
const DnsRecordGenerator = dynamic(() => import("./network/DnsRecordGenerator").then((m) => m.DnsRecordGenerator), { ssr: false });

const JsonFormatter = dynamic(() => import("./developer/JsonFormatter").then((m) => m.JsonFormatter), { ssr: false });
const JsonValidator = dynamic(() => import("./developer/JsonValidator").then((m) => m.JsonValidator), { ssr: false });
const Base64Encoder = dynamic(() => import("./developer/Base64Encoder").then((m) => m.Base64Encoder), { ssr: false });
const Base64Decoder = dynamic(() => import("./developer/Base64Decoder").then((m) => m.Base64Decoder), { ssr: false });
const Base64ImageConverter = dynamic(() => import("./developer/Base64ImageConverter").then((m) => m.Base64ImageConverter), { ssr: false });
const UuidGenerator = dynamic(() => import("./developer/UuidGenerator").then((m) => m.UuidGenerator), { ssr: false });
const BatchUuidGenerator = dynamic(() => import("./developer/BatchUuidGenerator").then((m) => m.BatchUuidGenerator), { ssr: false });
const TimestampConverter = dynamic(() => import("./developer/TimestampConverter").then((m) => m.TimestampConverter), { ssr: false });
const BatchTimestampConverter = dynamic(() => import("./developer/BatchTimestampConverter").then((m) => m.BatchTimestampConverter), { ssr: false });
const UrlEncoder = dynamic(() => import("./developer/UrlEncoder").then((m) => m.UrlEncoder), { ssr: false });
const UrlDecoder = dynamic(() => import("./developer/UrlDecoder").then((m) => m.UrlDecoder), { ssr: false });
const DiffChecker = dynamic(() => import("./developer/DiffChecker").then((m) => m.DiffChecker), { ssr: false });
const TextDiffHighlighter = dynamic(() => import("./developer/TextDiffHighlighter").then((m) => m.TextDiffHighlighter), { ssr: false });
const MarkdownPreviewer = dynamic(() => import("./developer/MarkdownPreviewer").then((m) => m.MarkdownPreviewer), { ssr: false });
const MarkdownTableGenerator = dynamic(() => import("./developer/MarkdownTableGenerator").then((m) => m.MarkdownTableGenerator), { ssr: false });
const CsvJsonConverter = dynamic(() => import("./developer/CsvJsonConverter").then((m) => m.CsvJsonConverter), { ssr: false });
const CaseConverter = dynamic(() => import("./developer/CaseConverter").then((m) => m.CaseConverter), { ssr: false });
const HashGenerator = dynamic(() => import("./developer/HashGenerator").then((m) => m.HashGenerator), { ssr: false });
const CronExpressionGenerator = dynamic(() => import("./developer/CronExpressionGenerator").then((m) => m.CronExpressionGenerator), { ssr: false });
const CronScheduleTester = dynamic(() => import("./developer/CronScheduleTester").then((m) => m.CronScheduleTester), { ssr: false });
const JwtDebugger = dynamic(() => import("./developer/JwtDebugger").then((m) => m.JwtDebugger), { ssr: false });
const JwtInspector = dynamic(() => import("./developer/JwtInspector").then((m) => m.JwtInspector), { ssr: false });
const CurlToFetchConverter = dynamic(() => import("./developer/CurlToFetchConverter").then((m) => m.CurlToFetchConverter), { ssr: false });
const CurlToPythonConverter = dynamic(() => import("./developer/CurlToPythonConverter").then((m) => m.CurlToPythonConverter), { ssr: false });
const CurlToAxiosConverter = dynamic(() => import("./developer/CurlToAxiosConverter").then((m) => m.CurlToAxiosConverter), { ssr: false });
const HtmlToMarkdownConverter = dynamic(() => import("./developer/HtmlToMarkdownConverter").then((m) => m.HtmlToMarkdownConverter), { ssr: false });
const HtmlEntityConverter = dynamic(() => import("./developer/HtmlEntityConverter").then((m) => m.HtmlEntityConverter), { ssr: false });
const RegexTester = dynamic(() => import("./developer/RegexTester").then((m) => m.RegexTester), { ssr: false });
const SqlFormatter = dynamic(() => import("./developer/SqlFormatter").then((m) => m.SqlFormatter), { ssr: false });
const SqlInClauseFormatter = dynamic(() => import("./developer/SqlInClauseFormatter").then((m) => m.SqlInClauseFormatter), { ssr: false });
const JsonToTypeScriptConverter = dynamic(() => import("./developer/JsonToTypeScriptConverter").then((m) => m.JsonToTypeScriptConverter), { ssr: false });
const ListCleaner = dynamic(() => import("./developer/ListCleaner").then((m) => m.ListCleaner), { ssr: false });
const JsonYamlConverter = dynamic(() => import("./developer/JsonYamlConverter").then((m) => m.JsonYamlConverter), { ssr: false });
const BaseConverter = dynamic(() => import("./developer/BaseConverter").then((m) => m.BaseConverter), { ssr: false });
const SlugGenerator = dynamic(() => import("./developer/SlugGenerator").then((m) => m.SlugGenerator), { ssr: false });
const JsonMinifier = dynamic(() => import("./developer/JsonMinifier").then((m) => m.JsonMinifier), { ssr: false });
const RandomTokenGenerator = dynamic(() => import("./developer/RandomTokenGenerator").then((m) => m.RandomTokenGenerator), { ssr: false });
const SvgPathVisualizer = dynamic(() => import("./developer/SvgPathVisualizer").then((m) => m.SvgPathVisualizer), { ssr: false });
const CsvColumnExtractor = dynamic(() => import("./developer/CsvColumnExtractor").then((m) => m.CsvColumnExtractor), { ssr: false });
const UrlQueryParamBuilder = dynamic(() => import("./developer/UrlQueryParamBuilder").then((m) => m.UrlQueryParamBuilder), { ssr: false });
const BinaryHexAsciiTranslator = dynamic(() => import("./developer/BinaryHexAsciiTranslator").then((m) => m.BinaryHexAsciiTranslator), { ssr: false });
const KeycodeVisualizer = dynamic(() => import("./developer/KeycodeVisualizer").then((m) => m.KeycodeVisualizer), { ssr: false });

const QrCodeGenerator = dynamic(() => import("./business/QrCodeGenerator").then((m) => m.QrCodeGenerator), { ssr: false });
const EmailSignatureGenerator = dynamic(() => import("./business/EmailSignatureGenerator").then((m) => m.EmailSignatureGenerator), { ssr: false });
const BusinessNameGenerator = dynamic(() => import("./business/BusinessNameGenerator").then((m) => m.BusinessNameGenerator), { ssr: false });
const InvoiceGenerator = dynamic(() => import("./business/InvoiceGenerator").then((m) => m.InvoiceGenerator), { ssr: false });
const UtmBuilder = dynamic(() => import("./business/UtmBuilder").then((m) => m.UtmBuilder), { ssr: false });
const BreakEvenCalculator = dynamic(() => import("./business/BreakEvenCalculator").then((m) => m.BreakEvenCalculator), { ssr: false });
const MeetingCostCalculator = dynamic(() => import("./business/MeetingCostCalculator").then((m) => m.MeetingCostCalculator), { ssr: false });
const SocialShareLinkGenerator = dynamic(() => import("./business/SocialShareLinkGenerator").then((m) => m.SocialShareLinkGenerator), { ssr: false });

const PercentageCalculator = dynamic(() => import("./finance/PercentageCalculator").then((m) => m.PercentageCalculator), { ssr: false });
const PercentageDifferenceCalculator = dynamic(() => import("./finance/PercentageDifferenceCalculator").then((m) => m.PercentageDifferenceCalculator), { ssr: false });
const PercentageOfTotalCalculator = dynamic(() => import("./finance/PercentageOfTotalCalculator").then((m) => m.PercentageOfTotalCalculator), { ssr: false });
const CompoundInterestCalculator = dynamic(() => import("./finance/CompoundInterestCalculator").then((m) => m.CompoundInterestCalculator), { ssr: false });
const SimpleInterestCalculator = dynamic(() => import("./finance/SimpleInterestCalculator").then((m) => m.SimpleInterestCalculator), { ssr: false });
const LoanCalculator = dynamic(() => import("./finance/LoanCalculator").then((m) => m.LoanCalculator), { ssr: false });
const LoanEmiCalculator = dynamic(() => import("./finance/LoanEmiCalculator").then((m) => m.LoanEmiCalculator), { ssr: false });
const LoanRefinanceCalculator = dynamic(() => import("./finance/LoanRefinanceCalculator").then((m) => m.LoanRefinanceCalculator), { ssr: false });
const AutoLoanEarlyPayoffCalculator = dynamic(() => import("./finance/AutoLoanEarlyPayoffCalculator").then((m) => m.AutoLoanEarlyPayoffCalculator), { ssr: false });
const CreditUtilizationCalculator = dynamic(() => import("./finance/CreditUtilizationCalculator").then((m) => m.CreditUtilizationCalculator), { ssr: false });
const DiscountCalculator = dynamic(() => import("./finance/DiscountCalculator").then((m) => m.DiscountCalculator), { ssr: false });
const DiscountStackingCalculator = dynamic(() => import("./finance/DiscountStackingCalculator").then((m) => m.DiscountStackingCalculator), { ssr: false });
const SalesMarginMarkupCalculator = dynamic(() => import("./finance/SalesMarginMarkupCalculator").then((m) => m.SalesMarginMarkupCalculator), { ssr: false });
const VatSalesTaxCalculator = dynamic(() => import("./finance/VatSalesTaxCalculator").then((m) => m.VatSalesTaxCalculator), { ssr: false });
const FreelanceHourlyRateCalculator = dynamic(() => import("./finance/FreelanceHourlyRateCalculator").then((m) => m.FreelanceHourlyRateCalculator), { ssr: false });
const SalaryHourlyConverter = dynamic(() => import("./finance/SalaryHourlyConverter").then((m) => m.SalaryHourlyConverter), { ssr: false });
const TakeHomePayCalculator = dynamic(() => import("./finance/TakeHomePayCalculator").then((m) => m.TakeHomePayCalculator), { ssr: false });
const MortgagePaymentCalculator = dynamic(() => import("./finance/MortgagePaymentCalculator").then((m) => m.MortgagePaymentCalculator), { ssr: false });
const InflationCalculator = dynamic(() => import("./finance/InflationCalculator").then((m) => m.InflationCalculator), { ssr: false });
const TipBillSplitter = dynamic(() => import("./finance/TipBillSplitter").then((m) => m.TipBillSplitter), { ssr: false });
const RoiCalculator = dynamic(() => import("./finance/RoiCalculator").then((m) => m.RoiCalculator), { ssr: false });
const CarLoanCalculator = dynamic(() => import("./finance/CarLoanCalculator").then((m) => m.CarLoanCalculator), { ssr: false });
const CagrCalculator = dynamic(() => import("./finance/CagrCalculator").then((m) => m.CagrCalculator), { ssr: false });
const CagrMatrixCalculator = dynamic(() => import("./finance/CagrMatrixCalculator").then((m) => m.CagrMatrixCalculator), { ssr: false });
const CreditCardPayoffCalculator = dynamic(() => import("./finance/CreditCardPayoffCalculator").then((m) => m.CreditCardPayoffCalculator), { ssr: false });
const SavingsGoalCalculator = dynamic(() => import("./finance/SavingsGoalCalculator").then((m) => m.SavingsGoalCalculator), { ssr: false });
const RuleOf72Calculator = dynamic(() => import("./finance/RuleOf72Calculator").then((m) => m.RuleOf72Calculator), { ssr: false });
const CryptoPnlCalculator = dynamic(() => import("./finance/CryptoPnlCalculator").then((m) => m.CryptoPnlCalculator), { ssr: false });
const EmergencyFundCalculator = dynamic(() => import("./finance/EmergencyFundCalculator").then((m) => m.EmergencyFundCalculator), { ssr: false });
const ExpenseRatioCalculator = dynamic(() => import("./finance/ExpenseRatioCalculator").then((m) => m.ExpenseRatioCalculator), { ssr: false });

const BmiCalculator = dynamic(() => import("./health/BmiCalculator").then((m) => m.BmiCalculator), { ssr: false });
const AgeCalculator = dynamic(() => import("./health/AgeCalculator").then((m) => m.AgeCalculator), { ssr: false });
const WaterIntakeCalculator = dynamic(() => import("./health/WaterIntakeCalculator").then((m) => m.WaterIntakeCalculator), { ssr: false });

const WordCounter = dynamic(() => import("./education/WordCounter").then((m) => m.WordCounter), { ssr: false });
const CharacterFrequencyCounter = dynamic(() => import("./education/CharacterFrequencyCounter").then((m) => m.CharacterFrequencyCounter), { ssr: false });
const WorkingDaysCalculator = dynamic(() => import("./education/WorkingDaysCalculator").then((m) => m.WorkingDaysCalculator), { ssr: false });
const GpaCalculator = dynamic(() => import("./education/GpaCalculator").then((m) => m.GpaCalculator), { ssr: false });
const UnitConverter = dynamic(() => import("./education/UnitConverter").then((m) => m.UnitConverter), { ssr: false });
const DecimalFractionConverter = dynamic(() => import("./education/DecimalFractionConverter").then((m) => m.DecimalFractionConverter), { ssr: false });
const TextCleaner = dynamic(() => import("./education/TextCleaner").then((m) => m.TextCleaner), { ssr: false });
const RomanNumeralConverter = dynamic(() => import("./education/RomanNumeralConverter").then((m) => m.RomanNumeralConverter), { ssr: false });
const TimeDurationCalculator = dynamic(() => import("./education/TimeDurationCalculator").then((m) => m.TimeDurationCalculator), { ssr: false });
const TimezoneMeetingPlanner = dynamic(() => import("./everyday/TimezoneMeetingPlanner").then((m) => m.TimezoneMeetingPlanner), { ssr: false });
const GasTripCalculator = dynamic(() => import("./everyday/GasTripCalculator").then((m) => m.GasTripCalculator), { ssr: false });

const ColorConverter = dynamic(() => import("./creative/ColorConverter").then((m) => m.ColorConverter), { ssr: false });
const ColorContrastChecker = dynamic(() => import("./creative/ColorContrastChecker").then((m) => m.ColorContrastChecker), { ssr: false });
const HexRgbHslPicker = dynamic(() => import("./creative/HexRgbHslPicker").then((m) => m.HexRgbHslPicker), { ssr: false });
const AspectRatioCalculator = dynamic(() => import("./creative/AspectRatioCalculator").then((m) => m.AspectRatioCalculator), { ssr: false });
const AspectRatioResizer = dynamic(() => import("./creative/AspectRatioResizer").then((m) => m.AspectRatioResizer), { ssr: false });
const AspectRatioCropper = dynamic(() => import("./creative/AspectRatioCropper").then((m) => m.AspectRatioCropper), { ssr: false });
const AspectRatioMultiplier = dynamic(() => import("./creative/AspectRatioMultiplier").then((m) => m.AspectRatioMultiplier), { ssr: false });
const GlassmorphismGenerator = dynamic(() => import("./creative/GlassmorphismGenerator").then((m) => m.GlassmorphismGenerator), { ssr: false });
const LetterboxPreviewer = dynamic(() => import("./creative/LetterboxPreviewer").then((m) => m.LetterboxPreviewer), { ssr: false });
const LoremIpsumGenerator = dynamic(() => import("./creative/LoremIpsumGenerator").then((m) => m.LoremIpsumGenerator), { ssr: false });
const LoremMarkdownGenerator = dynamic(() => import("./creative/LoremMarkdownGenerator").then((m) => m.LoremMarkdownGenerator), { ssr: false });
const ContentReadingTimeCalculator = dynamic(() => import("./creative/ContentReadingTimeCalculator").then((m) => m.ContentReadingTimeCalculator), { ssr: false });
const ReadingSpeedTest = dynamic(() => import("./creative/ReadingSpeedTest").then((m) => m.ReadingSpeedTest), { ssr: false });
const SocialMediaImageResizer = dynamic(() => import("./creative/SocialMediaImageResizer").then((m) => m.SocialMediaImageResizer), { ssr: false });

const TokenCounter = dynamic(() => import("./ai/TokenCounter").then((m) => m.TokenCounter), { ssr: false });
const PromptEnhancer = dynamic(() => import("./ai/PromptEnhancer").then((m) => m.PromptEnhancer), { ssr: false });
const LlmTokenCostCalculator = dynamic(() => import("./ai/LlmTokenCostCalculator").then((m) => m.LlmTokenCostCalculator), { ssr: false });
const AiSystemPromptGenerator = dynamic(() => import("./ai/AiSystemPromptGenerator").then((m) => m.AiSystemPromptGenerator), { ssr: false });

const GpuVramAiCalculator = dynamic(() => import("./hardware/GpuVramAiCalculator").then((m) => m.GpuVramAiCalculator), { ssr: false });
const ScreenPpiCalculator = dynamic(() => import("./hardware/ScreenPpiCalculator").then((m) => m.ScreenPpiCalculator), { ssr: false });
const ScreenComparator = dynamic(() => import("./hardware/ScreenComparator").then((m) => m.ScreenComparator), { ssr: false });
const PsuWattageCalculator = dynamic(() => import("./hardware/PsuWattageCalculator").then((m) => m.PsuWattageCalculator), { ssr: false });
const StorageConverter = dynamic(() => import("./hardware/StorageConverter").then((m) => m.StorageConverter), { ssr: false });
const PcBottleneckCalculator = dynamic(() => import("./hardware/PcBottleneckCalculator").then((m) => m.PcBottleneckCalculator), { ssr: false });
const ElectricityCostCalculator = dynamic(() => import("./hardware/ElectricityCostCalculator").then((m) => m.ElectricityCostCalculator), { ssr: false });

const TOOL_COMPONENTS: Record<string, React.ComponentType<any>> = {
  "random-number-generator": RandomNumberGenerator,
  "spin-wheel": SpinWheel,
  "coin-flip": CoinFlip,
  "dice-roller": DiceRoller,
  "random-picker": RandomPicker,
  "password-generator": PasswordGenerator,
  "username-generator": UsernameGenerator,
  "talking-alarm-clock": TalkingAlarmClock,
  "stopwatch-timer": StopwatchTimer,
  "morse-code-translator": MorseCodeTranslator,

  "my-ip": MyIp,
  "browser-info": BrowserInfo,
  "screen-resolution": ScreenResolution,
  "ping-test": PingTest,
  "dns-lookup": DnsLookup,
  "user-agent-checker": UserAgentChecker,
  "bandwidth-file-transfer-calculator": BandwidthCalculator,
  "network-port-reference": NetworkPortReference,
  "subnet-mask-calculator": SubnetCalculator,
  "ip-geolocation-lookup": IpGeolocationLookup,
  "dns-record-generator": DnsRecordGenerator,

  "json-formatter": JsonFormatter,
  "json-validator": JsonValidator,
  "base64-encoder": Base64Encoder,
  "base64-decoder": Base64Decoder,
  "base64-image-encoder-decoder": Base64ImageConverter,
  "uuid-generator": UuidGenerator,
  "uuid-v4-batch-generator": BatchUuidGenerator,
  "timestamp-converter": TimestampConverter,
  "unix-timestamp-batch-converter": BatchTimestampConverter,
  "url-encoder": UrlEncoder,
  "url-decoder": UrlDecoder,
  "diff-checker": DiffChecker,
  "text-diff-highlighter": TextDiffHighlighter,
  "markdown-previewer": MarkdownPreviewer,
  "markdown-table-generator": MarkdownTableGenerator,
  "csv-json-converter": CsvJsonConverter,
  "case-converter": CaseConverter,
  "hash-generator": HashGenerator,
  "cron-expression-generator": CronExpressionGenerator,
  "cron-schedule-tester": CronScheduleTester,
  "jwt-debugger": JwtDebugger,
  "jwt-payload-inspector-signer": JwtInspector,
  "curl-to-fetch-converter": CurlToFetchConverter,
  "curl-to-python-requests-converter": CurlToPythonConverter,
  "curl-to-javascript-axios-converter": CurlToAxiosConverter,
  "html-to-markdown-converter": HtmlToMarkdownConverter,
  "html-entity-encoder-decoder": HtmlEntityConverter,
  "regex-tester": RegexTester,
  "sql-formatter": SqlFormatter,
  "sql-in-clause-batch-formatter": SqlInClauseFormatter,
  "json-to-typescript-converter": JsonToTypeScriptConverter,
  "list-cleaner-deduplicator": ListCleaner,
  "json-yaml-converter": JsonYamlConverter,
  "hex-decimal-binary-converter": BaseConverter,
  "slug-generator": SlugGenerator,
  "json-minify-compressor": JsonMinifier,
  "random-string-token-generator": RandomTokenGenerator,
  "svg-path-visualizer-optimizer": SvgPathVisualizer,
  "csv-column-extractor-filter": CsvColumnExtractor,
  "url-parser-query-parameter-builder": UrlQueryParamBuilder,
  "binary-to-hex-text-ascii-translator": BinaryHexAsciiTranslator,
  "javascript-event-keycodes-reference": KeycodeVisualizer,

  "qr-code-generator": QrCodeGenerator,
  "email-signature-generator": EmailSignatureGenerator,
  "business-name-generator": BusinessNameGenerator,
  "invoice-generator": InvoiceGenerator,
  "utm-builder": UtmBuilder,
  "break-even-calculator": BreakEvenCalculator,
  "meeting-cost-calculator": MeetingCostCalculator,
  "social-share-link-generator": SocialShareLinkGenerator,

  "percentage-calculator": PercentageCalculator,
  "percentage-difference-calculator": PercentageDifferenceCalculator,
  "percentage-of-total-calculator": PercentageOfTotalCalculator,
  "compound-interest-calculator": CompoundInterestCalculator,
  "simple-interest-calculator": SimpleInterestCalculator,
  "loan-calculator": LoanCalculator,
  "loan-emi-calculator": LoanEmiCalculator,
  "loan-refinance-savings-calculator": LoanRefinanceCalculator,
  "auto-loan-early-payoff-calculator": AutoLoanEarlyPayoffCalculator,
  "credit-utilization-ratio-calculator": CreditUtilizationCalculator,
  "crypto-portfolio-profit-loss-calculator": CryptoPnlCalculator,
  "emergency-fund-runway-calculator": EmergencyFundCalculator,
  "investment-fee-expense-ratio-calculator": ExpenseRatioCalculator,
  "discount-calculator": DiscountCalculator,
  "discount-stacking-calculator": DiscountStackingCalculator,
  "sales-margin-markup-calculator": SalesMarginMarkupCalculator,
  "vat-sales-tax-calculator": VatSalesTaxCalculator,
  "freelance-hourly-rate-calculator": FreelanceHourlyRateCalculator,
  "salary-hourly-converter": SalaryHourlyConverter,
  "salary-after-tax-take-home-calculator": TakeHomePayCalculator,
  "mortgage-payment-calculator": MortgagePaymentCalculator,
  "inflation-calculator": InflationCalculator,
  "tip-bill-splitter": TipBillSplitter,
  "roi-investment-calculator": RoiCalculator,
  "car-loan-affordability-calculator": CarLoanCalculator,
  "cagr-calculator": CagrCalculator,
  "compound-annual-growth-rate-matrix": CagrMatrixCalculator,
  "credit-card-payoff-calculator": CreditCardPayoffCalculator,
  "compound-savings-goal-calculator": SavingsGoalCalculator,
  "investment-doubling-rule-of-72-calculator": RuleOf72Calculator,

  "bmi-calculator": BmiCalculator,
  "age-calculator": AgeCalculator,
  "water-intake-calculator": WaterIntakeCalculator,

  "word-counter": WordCounter,
  "character-frequency-counter": CharacterFrequencyCounter,
  "working-days-calculator": WorkingDaysCalculator,
  "gpa-calculator": GpaCalculator,
  "unit-converter": UnitConverter,
  "decimal-to-fraction-converter": DecimalFractionConverter,
  "text-cleaner-formatter": TextCleaner,
  "roman-numeral-converter": RomanNumeralConverter,
  "hours-minutes-time-duration-calculator": TimeDurationCalculator,
  "timezone-meeting-planner": TimezoneMeetingPlanner,
  "gas-trip-cost-calculator": GasTripCalculator,

  "color-converter": ColorConverter,
  "color-contrast-checker": ColorContrastChecker,
  "hex-rgb-hsl-picker": HexRgbHslPicker,
  "aspect-ratio-calculator": AspectRatioCalculator,
  "aspect-ratio-resizer": AspectRatioResizer,
  "aspect-ratio-crop-previewer": AspectRatioCropper,
  "aspect-ratio-scale-multiplier": AspectRatioMultiplier,
  "aspect-ratio-letterbox-pillarbox-previewer": LetterboxPreviewer,
  "css-glassmorphism-generator": GlassmorphismGenerator,
  "lorem-ipsum-generator": LoremIpsumGenerator,
  "lorem-markdown-generator": LoremMarkdownGenerator,
  "content-reading-time-calculator": ContentReadingTimeCalculator,
  "reading-speed-test": ReadingSpeedTest,
  "social-media-image-resizer": SocialMediaImageResizer,

  "token-counter": TokenCounter,
  "prompt-enhancer": PromptEnhancer,
  "llm-token-cost-calculator": LlmTokenCostCalculator,
  "ai-system-prompt-generator": AiSystemPromptGenerator,

  "gpu-vram-ai-calculator": GpuVramAiCalculator,
  "screen-ppi-calculator": ScreenPpiCalculator,
  "screen-aspect-ratio-comparator": ScreenComparator,
  "psu-wattage-calculator": PsuWattageCalculator,
  "storage-converter": StorageConverter,
  "pc-bottleneck-calculator": PcBottleneckCalculator,
  "electricity-cost-calculator": ElectricityCostCalculator,
};

interface ToolDispatcherProps {
  utility: UtilityItem;
}

export function ToolDispatcher({ utility }: ToolDispatcherProps) {
  const Component = TOOL_COMPONENTS[utility.slug];

  if (!Component) {
    return (
      <div className="p-8 border border-border rounded-xl bg-card text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">Utility "{utility.name}" is loaded in registry.</p>
        <p className="text-xs text-muted-foreground">Interactive component mounting...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Component />
    </div>
  );
}
