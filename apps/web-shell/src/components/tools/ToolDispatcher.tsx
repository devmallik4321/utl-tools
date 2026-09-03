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
const CidrExpander = dynamic(() => import("./network/CidrExpander").then((m) => m.CidrExpander), { ssr: false });
const Ipv6SubnetCalculator = dynamic(() => import("./network/Ipv6SubnetCalculator").then((m) => m.Ipv6SubnetCalculator), { ssr: false });
const IpGeolocationLookup = dynamic(() => import("./network/IpGeolocationLookup").then((m) => m.IpGeolocationLookup), { ssr: false });
const DnsRecordGenerator = dynamic(() => import("./network/DnsRecordGenerator").then((m) => m.DnsRecordGenerator), { ssr: false });
const EmailDnsGenerator = dynamic(() => import("./network/EmailDnsGenerator").then((m) => m.EmailDnsGenerator), { ssr: false });
const SpfRecordBuilder = dynamic(() => import("./network/SpfRecordBuilder").then((m) => m.SpfRecordBuilder), { ssr: false });
const CertDecoder = dynamic(() => import("./network/CertDecoder").then((m) => m.CertDecoder), { ssr: false });
const HttpStatusReference = dynamic(() => import("./network/HttpStatusReference").then((m) => m.HttpStatusReference), { ssr: false });
const MacAddressConverter = dynamic(() => import("./network/MacAddressConverter").then((m) => m.MacAddressConverter), { ssr: false });
const DnsResolversReference = dynamic(() => import("./network/DnsResolversReference").then((m) => m.DnsResolversReference), { ssr: false });
const IpBinaryConverter = dynamic(() => import("./network/IpBinaryConverter").then((m) => m.IpBinaryConverter), { ssr: false });
const WhoisParser = dynamic(() => import("./network/WhoisParser").then((m) => m.WhoisParser), { ssr: false });
const Ipv4ToIpv6Converter = dynamic(() => import("./network/Ipv4ToIpv6Converter").then((m) => m.Ipv4ToIpv6Converter), { ssr: false });
const ReverseDnsPtrGenerator = dynamic(() => import("./network/ReverseDnsPtrGenerator").then((m) => m.ReverseDnsPtrGenerator), { ssr: false });

const JsonFormatter = dynamic(() => import("./developer/JsonFormatter").then((m) => m.JsonFormatter), { ssr: false });
const JsonValidator = dynamic(() => import("./developer/JsonValidator").then((m) => m.JsonValidator), { ssr: false });
const Base64Encoder = dynamic(() => import("./developer/Base64Encoder").then((m) => m.Base64Encoder), { ssr: false });
const Base64Decoder = dynamic(() => import("./developer/Base64Decoder").then((m) => m.Base64Decoder), { ssr: false });
const Base64ImageConverter = dynamic(() => import("./developer/Base64ImageConverter").then((m) => m.Base64ImageConverter), { ssr: false });
const Base32Converter = dynamic(() => import("./developer/Base32Converter").then((m) => m.Base32Converter), { ssr: false });
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
const LoremDocsGenerator = dynamic(() => import("./developer/LoremDocsGenerator").then((m) => m.LoremDocsGenerator), { ssr: false });
const CsvJsonConverter = dynamic(() => import("./developer/CsvJsonConverter").then((m) => m.CsvJsonConverter), { ssr: false });
const TsvConverter = dynamic(() => import("./developer/TsvConverter").then((m) => m.TsvConverter), { ssr: false });
const CsvToSqliteConverter = dynamic(() => import("./developer/CsvToSqliteConverter").then((m) => m.CsvToSqliteConverter), { ssr: false });
const JsonToCsvConverter = dynamic(() => import("./developer/JsonToCsvConverter").then((m) => m.JsonToCsvConverter), { ssr: false });
const YamlToJsonConverter = dynamic(() => import("./developer/YamlToJsonConverter").then((m) => m.YamlToJsonConverter), { ssr: false });
const JsonToXmlConverter = dynamic(() => import("./developer/JsonToXmlConverter").then((m) => m.JsonToXmlConverter), { ssr: false });
const JsonBeautifyMinify = dynamic(() => import("./developer/JsonBeautifyMinify").then((m) => m.JsonBeautifyMinify), { ssr: false });
const CaseConverter = dynamic(() => import("./developer/CaseConverter").then((m) => m.CaseConverter), { ssr: false });
const HashGenerator = dynamic(() => import("./developer/HashGenerator").then((m) => m.HashGenerator), { ssr: false });
const CronExpressionGenerator = dynamic(() => import("./developer/CronExpressionGenerator").then((m) => m.CronExpressionGenerator), { ssr: false });
const CronScheduleTester = dynamic(() => import("./developer/CronScheduleTester").then((m) => m.CronScheduleTester), { ssr: false });
const CronExplainer = dynamic(() => import("./developer/CronExplainer").then((m) => m.CronExplainer), { ssr: false });
const CrontabValidator = dynamic(() => import("./developer/CrontabValidator").then((m) => m.CrontabValidator), { ssr: false });
const CronScheduleBuilder = dynamic(() => import("./developer/CronScheduleBuilder").then((m) => m.CronScheduleBuilder), { ssr: false });
const CronNextRunsCalculator = dynamic(() => import("./developer/CronNextRunsCalculator").then((m) => m.CronNextRunsCalculator), { ssr: false });
const CronToSystemdConverter = dynamic(() => import("./developer/CronToSystemdConverter").then((m) => m.CronToSystemdConverter), { ssr: false });
const CronToEventBridgeConverter = dynamic(() => import("./developer/CronToEventBridgeConverter").then((m) => m.CronToEventBridgeConverter), { ssr: false });
const JwtDebugger = dynamic(() => import("./developer/JwtDebugger").then((m) => m.JwtDebugger), { ssr: false });
const JwtInspector = dynamic(() => import("./developer/JwtInspector").then((m) => m.JwtInspector), { ssr: false });
const CurlToFetchConverter = dynamic(() => import("./developer/CurlToFetchConverter").then((m) => m.CurlToFetchConverter), { ssr: false });
const CurlToPythonConverter = dynamic(() => import("./developer/CurlToPythonConverter").then((m) => m.CurlToPythonConverter), { ssr: false });
const CurlToAxiosConverter = dynamic(() => import("./developer/CurlToAxiosConverter").then((m) => m.CurlToAxiosConverter), { ssr: false });
const CurlToPhpConverter = dynamic(() => import("./developer/CurlToPhpConverter").then((m) => m.CurlToPhpConverter), { ssr: false });
const CurlToGoConverter = dynamic(() => import("./developer/CurlToGoConverter").then((m) => m.CurlToGoConverter), { ssr: false });
const CurlToRubyConverter = dynamic(() => import("./developer/CurlToRubyConverter").then((m) => m.CurlToRubyConverter), { ssr: false });
const CurlToRustConverter = dynamic(() => import("./developer/CurlToRustConverter").then((m) => m.CurlToRustConverter), { ssr: false });
const CurlToCSharpConverter = dynamic(() => import("./developer/CurlToCSharpConverter").then((m) => m.CurlToCSharpConverter), { ssr: false });
const CurlToDartConverter = dynamic(() => import("./developer/CurlToDartConverter").then((m) => m.CurlToDartConverter), { ssr: false });
const CurlToKotlinConverter = dynamic(() => import("./developer/CurlToKotlinConverter").then((m) => m.CurlToKotlinConverter), { ssr: false });
const CurlToSwiftConverter = dynamic(() => import("./developer/CurlToSwiftConverter").then((m) => m.CurlToSwiftConverter), { ssr: false });
const CurlToPowerShellConverter = dynamic(() => import("./developer/CurlToPowerShellConverter").then((m) => m.CurlToPowerShellConverter), { ssr: false });
const CurlToRConverter = dynamic(() => import("./developer/CurlToRConverter").then((m) => m.CurlToRConverter), { ssr: false });
const CurlToClojureConverter = dynamic(() => import("./developer/CurlToClojureConverter").then((m) => m.CurlToClojureConverter), { ssr: false });
const HtmlToMarkdownConverter = dynamic(() => import("./developer/HtmlToMarkdownConverter").then((m) => m.HtmlToMarkdownConverter), { ssr: false });
const HtmlEntityConverter = dynamic(() => import("./developer/HtmlEntityConverter").then((m) => m.HtmlEntityConverter), { ssr: false });
const RegexTester = dynamic(() => import("./developer/RegexTester").then((m) => m.RegexTester), { ssr: false });
const RegexReference = dynamic(() => import("./developer/RegexReference").then((m) => m.RegexReference), { ssr: false });
const SqlFormatter = dynamic(() => import("./developer/SqlFormatter").then((m) => m.SqlFormatter), { ssr: false });
const SqlInClauseFormatter = dynamic(() => import("./developer/SqlInClauseFormatter").then((m) => m.SqlInClauseFormatter), { ssr: false });
const JsonToTypeScriptConverter = dynamic(() => import("./developer/JsonToTypeScriptConverter").then((m) => m.JsonToTypeScriptConverter), { ssr: false });
const JsonSchemaToTypeConverter = dynamic(() => import("./developer/JsonSchemaToTypeConverter").then((m) => m.JsonSchemaToTypeConverter), { ssr: false });
const JsonSchemaToZodConverter = dynamic(() => import("./developer/JsonToZodConverter").then((m) => m.JsonToZodConverter), { ssr: false });
const JsonToEnvConverter = dynamic(() => import("./developer/JsonToEnvConverter").then((m) => m.JsonToEnvConverter), { ssr: false });
const ListCleaner = dynamic(() => import("./developer/ListCleaner").then((m) => m.ListCleaner), { ssr: false });
const JsonYamlConverter = dynamic(() => import("./developer/JsonYamlConverter").then((m) => m.JsonYamlConverter), { ssr: false });
const BaseConverter = dynamic(() => import("./developer/BaseConverter").then((m) => m.BaseConverter), { ssr: false });
const SlugGenerator = dynamic(() => import("./developer/SlugGenerator").then((m) => m.SlugGenerator), { ssr: false });
const JsonMinifier = dynamic(() => import("./developer/JsonMinifier").then((m) => m.JsonMinifier), { ssr: false });
const MockJsonGenerator = dynamic(() => import("./developer/MockJsonGenerator").then((m) => m.MockJsonGenerator), { ssr: false });
const RandomTokenGenerator = dynamic(() => import("./developer/RandomTokenGenerator").then((m) => m.RandomTokenGenerator), { ssr: false });
const SvgPathVisualizer = dynamic(() => import("./developer/SvgPathVisualizer").then((m) => m.SvgPathVisualizer), { ssr: false });
const CsvColumnExtractor = dynamic(() => import("./developer/CsvColumnExtractor").then((m) => m.CsvColumnExtractor), { ssr: false });
const UrlQueryParamBuilder = dynamic(() => import("./developer/UrlQueryParamBuilder").then((m) => m.UrlQueryParamBuilder), { ssr: false });
const BinaryHexAsciiTranslator = dynamic(() => import("./developer/BinaryHexAsciiTranslator").then((m) => m.BinaryHexAsciiTranslator), { ssr: false });
const KeycodeVisualizer = dynamic(() => import("./developer/KeycodeVisualizer").then((m) => m.KeycodeVisualizer), { ssr: false });
const BcryptCostCalculator = dynamic(() => import("./developer/BcryptCostCalculator").then((m) => m.BcryptCostCalculator), { ssr: false });
const PasswordEntropyMeter = dynamic(() => import("./developer/PasswordEntropyMeter").then((m) => m.PasswordEntropyMeter), { ssr: false });

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
const HelocCalculator = dynamic(() => import("./finance/HelocCalculator").then((m) => m.HelocCalculator), { ssr: false });
const AmortizationVisualizer = dynamic(() => import("./finance/AmortizationVisualizer").then((m) => m.AmortizationVisualizer), { ssr: false });
const AnnuityCalculator = dynamic(() => import("./finance/AnnuityCalculator").then((m) => m.AnnuityCalculator), { ssr: false });
const FourZeroOneKCalculator = dynamic(() => import("./finance/FourZeroOneKCalculator").then((m) => m.FourZeroOneKCalculator), { ssr: false });
const RothIraCalculator = dynamic(() => import("./finance/RothIraCalculator").then((m) => m.RothIraCalculator), { ssr: false });
const BackdoorRothCalculator = dynamic(() => import("./finance/BackdoorRothCalculator").then((m) => m.BackdoorRothCalculator), { ssr: false });
const HsaCalculator = dynamic(() => import("./finance/HsaCalculator").then((m) => m.HsaCalculator), { ssr: false });
const DownPaymentCalculator = dynamic(() => import("./finance/DownPaymentCalculator").then((m) => m.DownPaymentCalculator), { ssr: false });
const CdLadderCalculator = dynamic(() => import("./finance/CdLadderCalculator").then((m) => m.CdLadderCalculator), { ssr: false });
const TraditionalVsRothCalculator = dynamic(() => import("./finance/TraditionalVsRothCalculator").then((m) => m.TraditionalVsRothCalculator), { ssr: false });
const TargetDateFundCalculator = dynamic(() => import("./finance/TargetDateFundCalculator").then((m) => m.TargetDateFundCalculator), { ssr: false });
const HomeAffordabilityCalculator = dynamic(() => import("./finance/HomeAffordabilityCalculator").then((m) => m.HomeAffordabilityCalculator), { ssr: false });
const CapRateCalculator = dynamic(() => import("./finance/CapRateCalculator").then((m) => m.CapRateCalculator), { ssr: false });
const CashOnCashCalculator = dynamic(() => import("./finance/CashOnCashCalculator").then((m) => m.CashOnCashCalculator), { ssr: false });
const HouseFlippingCalculator = dynamic(() => import("./finance/HouseFlippingCalculator").then((m) => m.HouseFlippingCalculator), { ssr: false });
const MortgageRecastCalculator = dynamic(() => import("./finance/MortgageRecastCalculator").then((m) => m.MortgageRecastCalculator), { ssr: false });
const LandLoanCalculator = dynamic(() => import("./finance/LandLoanCalculator").then((m) => m.LandLoanCalculator), { ssr: false });
const SolarPaybackCalculator = dynamic(() => import("./finance/SolarPaybackCalculator").then((m) => m.SolarPaybackCalculator), { ssr: false });
const EvSavingsCalculator = dynamic(() => import("./finance/EvSavingsCalculator").then((m) => m.EvSavingsCalculator), { ssr: false });
const FiveTwoNineCalculator = dynamic(() => import("./finance/FiveTwoNineCalculator").then((m) => m.FiveTwoNineCalculator), { ssr: false });
const UgmaUtmaCalculator = dynamic(() => import("./finance/UgmaUtmaCalculator").then((m) => m.UgmaUtmaCalculator), { ssr: false });
const CommuteCostCalculator = dynamic(() => import("./finance/CommuteCostCalculator").then((m) => m.CommuteCostCalculator), { ssr: false });
const InflationSalaryCalculator = dynamic(() => import("./finance/InflationSalaryCalculator").then((m) => m.InflationSalaryCalculator), { ssr: false });
const SalaryInflationCalculator = dynamic(() => import("./finance/SalaryInflationCalculator").then((m) => m.SalaryInflationCalculator), { ssr: false });
const HourlyPaycheckOvertimeCalculator = dynamic(() => import("./finance/OvertimeCalculator").then((m) => m.OvertimeCalculator), { ssr: false });
const DebtPayoffCalculator = dynamic(() => import("./finance/DebtPayoffCalculator").then((m) => m.DebtPayoffCalculator), { ssr: false });
const CreditUtilizationCalculator = dynamic(() => import("./finance/CreditUtilizationCalculator").then((m) => m.CreditUtilizationCalculator), { ssr: false });
const CryptoPnlCalculator = dynamic(() => import("./finance/CryptoPnlCalculator").then((m) => m.CryptoPnlCalculator), { ssr: false });
const EmergencyFundCalculator = dynamic(() => import("./finance/EmergencyFundCalculator").then((m) => m.EmergencyFundCalculator), { ssr: false });
const ExpenseRatioCalculator = dynamic(() => import("./finance/ExpenseRatioCalculator").then((m) => m.ExpenseRatioCalculator), { ssr: false });
const NetWorthCalculator = dynamic(() => import("./finance/NetWorthCalculator").then((m) => m.NetWorthCalculator), { ssr: false });
const DripCalculator = dynamic(() => import("./finance/DripCalculator").then((m) => m.DripCalculator), { ssr: false });
const DiscountCalculator = dynamic(() => import("./finance/DiscountCalculator").then((m) => m.DiscountCalculator), { ssr: false });
const DiscountStackingCalculator = dynamic(() => import("./finance/DiscountStackingCalculator").then((m) => m.DiscountStackingCalculator), { ssr: false });
const SalesMarginMarkupCalculator = dynamic(() => import("./finance/SalesMarginMarkupCalculator").then((m) => m.SalesMarginMarkupCalculator), { ssr: false });
const VatSalesTaxCalculator = dynamic(() => import("./finance/VatSalesTaxCalculator").then((m) => m.VatSalesTaxCalculator), { ssr: false });
const FreelanceHourlyRateCalculator = dynamic(() => import("./finance/FreelanceHourlyRateCalculator").then((m) => m.FreelanceHourlyRateCalculator), { ssr: false });
const SalaryHourlyConverter = dynamic(() => import("./finance/SalaryHourlyConverter").then((m) => m.SalaryHourlyConverter), { ssr: false });
const TakeHomePayCalculator = dynamic(() => import("./finance/TakeHomePayCalculator").then((m) => m.TakeHomePayCalculator), { ssr: false });
const MortgagePaymentCalculator = dynamic(() => import("./finance/MortgagePaymentCalculator").then((m) => m.MortgagePaymentCalculator), { ssr: false });
const InflationCalculator = dynamic(() => import("./finance/InflationCalculator").then((m) => m.InflationCalculator), { ssr: false });
const PurchasingPowerCalculator = dynamic(() => import("./finance/PurchasingPowerCalculator").then((m) => m.PurchasingPowerCalculator), { ssr: false });
const TipBillSplitter = dynamic(() => import("./finance/TipBillSplitter").then((m) => m.TipBillSplitter), { ssr: false });
const RoiCalculator = dynamic(() => import("./finance/RoiCalculator").then((m) => m.RoiCalculator), { ssr: false });
const CarLoanCalculator = dynamic(() => import("./finance/CarLoanCalculator").then((m) => m.CarLoanCalculator), { ssr: false });
const LeaseVsBuyCalculator = dynamic(() => import("./finance/LeaseVsBuyCalculator").then((m) => m.LeaseVsBuyCalculator), { ssr: false });
const CagrCalculator = dynamic(() => import("./finance/CagrCalculator").then((m) => m.CagrCalculator), { ssr: false });
const CagrMatrixCalculator = dynamic(() => import("./finance/CagrMatrixCalculator").then((m) => m.CagrMatrixCalculator), { ssr: false });
const CreditCardPayoffCalculator = dynamic(() => import("./finance/CreditCardPayoffCalculator").then((m) => m.CreditCardPayoffCalculator), { ssr: false });
const SavingsGoalCalculator = dynamic(() => import("./finance/SavingsGoalCalculator").then((m) => m.SavingsGoalCalculator), { ssr: false });
const RuleOf72Calculator = dynamic(() => import("./finance/RuleOf72Calculator").then((m) => m.RuleOf72Calculator), { ssr: false });
const FireCalculator = dynamic(() => import("./finance/FireCalculator").then((m) => m.FireCalculator), { ssr: false });
const SmaCalculator = dynamic(() => import("./finance/SmaCalculator").then((m) => m.SmaCalculator), { ssr: false });

const BmiCalculator = dynamic(() => import("./health/BmiCalculator").then((m) => m.BmiCalculator), { ssr: false });
const AgeCalculator = dynamic(() => import("./health/AgeCalculator").then((m) => m.AgeCalculator), { ssr: false });
const WaterIntakeCalculator = dynamic(() => import("./health/WaterIntakeCalculator").then((m) => m.WaterIntakeCalculator), { ssr: false });
const StepsToMilesConverter = dynamic(() => import("./health/StepsToMilesConverter").then((m) => m.StepsToMilesConverter), { ssr: false });
const SleepCycleCalculator = dynamic(() => import("./health/SleepCycleCalculator").then((m) => m.SleepCycleCalculator), { ssr: false });
const CaffeineHalfLifeCalculator = dynamic(() => import("./health/CaffeineHalfLifeCalculator").then((m) => m.CaffeineHalfLifeCalculator), { ssr: false });
const IdealBodyWeightCalculator = dynamic(() => import("./health/IdealBodyWeightCalculator").then((m) => m.IdealBodyWeightCalculator), { ssr: false });
const BodyFatNavyCalculator = dynamic(() => import("./health/BodyFatNavyCalculator").then((m) => m.BodyFatNavyCalculator), { ssr: false });
const MacroSplitCalculator = dynamic(() => import("./health/MacroSplitCalculator").then((m) => m.MacroSplitCalculator), { ssr: false });

const WordCounter = dynamic(() => import("./education/WordCounter").then((m) => m.WordCounter), { ssr: false });
const CharacterFrequencyCounter = dynamic(() => import("./education/CharacterFrequencyCounter").then((m) => m.CharacterFrequencyCounter), { ssr: false });
const WorkingDaysCalculator = dynamic(() => import("./education/WorkingDaysCalculator").then((m) => m.WorkingDaysCalculator), { ssr: false });
const GpaCalculator = dynamic(() => import("./education/GpaCalculator").then((m) => m.GpaCalculator), { ssr: false });
const UnitConverter = dynamic(() => import("./education/UnitConverter").then((m) => m.UnitConverter), { ssr: false });
const KitchenUnitConverter = dynamic(() => import("./education/KitchenUnitConverter").then((m) => m.KitchenUnitConverter), { ssr: false });
const FuelEfficiencyConverter = dynamic(() => import("./education/FuelEfficiencyConverter").then((m) => m.FuelEfficiencyConverter), { ssr: false });
const DecimalFractionConverter = dynamic(() => import("./education/DecimalFractionConverter").then((m) => m.DecimalFractionConverter), { ssr: false });
const TextCleaner = dynamic(() => import("./education/TextCleaner").then((m) => m.TextCleaner), { ssr: false });
const RomanNumeralConverter = dynamic(() => import("./education/RomanNumeralConverter").then((m) => m.RomanNumeralConverter), { ssr: false });
const TimeDurationCalculator = dynamic(() => import("./education/TimeDurationCalculator").then((m) => m.TimeDurationCalculator), { ssr: false });
const ScientificNotationConverter = dynamic(() => import("./education/ScientificNotationConverter").then((m) => m.ScientificNotationConverter), { ssr: false });

const TimezoneMeetingPlanner = dynamic(() => import("./everyday/TimezoneMeetingPlanner").then((m) => m.TimezoneMeetingPlanner), { ssr: false });
const GasTripCalculator = dynamic(() => import("./everyday/GasTripCalculator").then((m) => m.GasTripCalculator), { ssr: false });
const CountdownTimer = dynamic(() => import("./everyday/CountdownTimer").then((m) => m.CountdownTimer), { ssr: false });

const ColorConverter = dynamic(() => import("./creative/ColorConverter").then((m) => m.ColorConverter), { ssr: false });
const ColorContrastChecker = dynamic(() => import("./creative/ColorContrastChecker").then((m) => m.ColorContrastChecker), { ssr: false });
const HexRgbHslPicker = dynamic(() => import("./creative/HexRgbHslPicker").then((m) => m.HexRgbHslPicker), { ssr: false });
const HexColorShades = dynamic(() => import("./creative/ColorShadesGenerator").then((m) => m.ColorShadesGenerator), { ssr: false });
const AspectRatioCalculator = dynamic(() => import("./creative/AspectRatioCalculator").then((m) => m.AspectRatioCalculator), { ssr: false });
const AspectRatioResizer = dynamic(() => import("./creative/AspectRatioResizer").then((m) => m.AspectRatioResizer), { ssr: false });
const AspectRatioCropper = dynamic(() => import("./creative/AspectRatioCropper").then((m) => m.AspectRatioCropper), { ssr: false });
const AspectRatioMultiplier = dynamic(() => import("./creative/AspectRatioMultiplier").then((m) => m.AspectRatioMultiplier), { ssr: false });
const AspectRatioLetterbox = dynamic(() => import("./creative/LetterboxPreviewer").then((m) => m.LetterboxPreviewer), { ssr: false });
const AspectRatioPixelDensity = dynamic(() => import("./creative/PixelDensityConverter").then((m) => m.PixelDensityConverter), { ssr: false });
const AspectRatioScaleFactor = dynamic(() => import("./creative/ScaleFactorCalculator").then((m) => m.ScaleFactorCalculator), { ssr: false });
const AspectRatioCssObjectFit = dynamic(() => import("./creative/ObjectFitPreviewer").then((m) => m.ObjectFitPreviewer), { ssr: false });
const AspectRatioPrintDpi = dynamic(() => import("./creative/PrintResolutionCalculator").then((m) => m.PrintResolutionCalculator), { ssr: false });
const AspectRatioCssGenerator = dynamic(() => import("./creative/CssAspectRatioGenerator").then((m) => m.CssAspectRatioGenerator), { ssr: false });
const AspectRatioCinemaAnamorphic = dynamic(() => import("./creative/AnamorphicCalculator").then((m) => m.AnamorphicCalculator), { ssr: false });
const AspectRatioVideoWall = dynamic(() => import("./creative/VideoWallCalculator").then((m) => m.VideoWallCalculator), { ssr: false });
const CssPaddingHack = dynamic(() => import("./creative/CssPaddingHackCalculator").then((m) => m.CssPaddingHackCalculator), { ssr: false });
const DeviceDimensionsReference = dynamic(() => import("./creative/DeviceDimensionsReference").then((m) => m.DeviceDimensionsReference), { ssr: false });
const FluidTypographyCalculator = dynamic(() => import("./creative/FluidTypographyCalculator").then((m) => m.FluidTypographyCalculator), { ssr: false });
const GlassmorphismGenerator = dynamic(() => import("./creative/GlassmorphismGenerator").then((m) => m.GlassmorphismGenerator), { ssr: false });
const NeumorphismGenerator = dynamic(() => import("./creative/NeumorphismGenerator").then((m) => m.NeumorphismGenerator), { ssr: false });
const BoxShadowGenerator = dynamic(() => import("./creative/BoxShadowGenerator").then((m) => m.BoxShadowGenerator), { ssr: false });
const BoxReflectionGenerator = dynamic(() => import("./creative/BoxReflectionGenerator").then((m) => m.BoxReflectionGenerator), { ssr: false });
const ScrollbarGenerator = dynamic(() => import("./creative/ScrollbarGenerator").then((m) => m.ScrollbarGenerator), { ssr: false });
const CssStripesGenerator = dynamic(() => import("./creative/CssStripesGenerator").then((m) => m.CssStripesGenerator), { ssr: false });
const ConicGradientGenerator = dynamic(() => import("./creative/ConicGradientGenerator").then((m) => m.ConicGradientGenerator), { ssr: false });
const MeshGradientGenerator = dynamic(() => import("./creative/MeshGradientGenerator").then((m) => m.MeshGradientGenerator), { ssr: false });
const LinearRgbConverter = dynamic(() => import("./creative/LinearRgbConverter").then((m) => m.LinearRgbConverter), { ssr: false });
const GradientGenerator = dynamic(() => import("./creative/GradientGenerator").then((m) => m.GradientGenerator), { ssr: false });
const CssTriangleGenerator = dynamic(() => import("./creative/CssTriangleGenerator").then((m) => m.CssTriangleGenerator), { ssr: false });
const ClipPathGenerator = dynamic(() => import("./creative/ClipPathGenerator").then((m) => m.ClipPathGenerator), { ssr: false });
const VideoBitrateCalculator = dynamic(() => import("./creative/VideoBitrateCalculator").then((m) => m.VideoBitrateCalculator), { ssr: false });
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
const ScreenAspectComparator = dynamic(() => import("./hardware/ScreenComparator").then((m) => m.ScreenComparator), { ssr: false });
const ScreenFovCalculator = dynamic(() => import("./hardware/FovCalculator").then((m) => m.FovCalculator), { ssr: false });
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
  "subnet-cidr-to-ip-range-expander": CidrExpander,
  "ipv6-subnet-prefix-calculator": Ipv6SubnetCalculator,
  "ip-geolocation-lookup": IpGeolocationLookup,
  "dns-record-generator": DnsRecordGenerator,
  "email-dns-records-generator": EmailDnsGenerator,
  "dns-spf-record-builder": SpfRecordBuilder,
  "ssl-tls-certificate-decoder-inspector": CertDecoder,
  "http-status-codes-reference": HttpStatusReference,
  "mac-address-format-converter": MacAddressConverter,
  "dns-propagation-checker-reference": DnsResolversReference,
  "ip-address-to-binary-hex-converter": IpBinaryConverter,
  "whois-asn-format-parser": WhoisParser,
  "ipv4-to-ipv6-mapping-converter": Ipv4ToIpv6Converter,
  "reverse-dns-ptr-record-generator": ReverseDnsPtrGenerator,

  "json-formatter": JsonFormatter,
  "json-validator": JsonValidator,
  "base64-encoder": Base64Encoder,
  "base64-decoder": Base64Decoder,
  "base64-image-encoder-decoder": Base64ImageConverter,
  "base32-encode-decode-utility": Base32Converter,
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
  "lorem-markdown-documentation-generator": LoremDocsGenerator,
  "csv-json-converter": CsvJsonConverter,
  "tsv-to-json-csv-converter": TsvConverter,
  "csv-to-sqlite-ddl-converter": CsvToSqliteConverter,
  "json-to-csv-table-converter": JsonToCsvConverter,
  "yaml-to-json-online-converter": YamlToJsonConverter,
  "json-to-xml-online-converter": JsonToXmlConverter,
  "json-minify-beautify-validator": JsonBeautifyMinify,
  "case-converter": CaseConverter,
  "hash-generator": HashGenerator,
  "cron-expression-generator": CronExpressionGenerator,
  "cron-schedule-tester": CronScheduleTester,
  "cron-job-human-readable-explainer": CronExplainer,
  "crontab-generator-and-validator": CrontabValidator,
  "cron-schedule-human-expression-builder": CronScheduleBuilder,
  "crontab-schedule-next-runs-calculator": CronNextRunsCalculator,
  "crontab-to-systemd-timer-converter": CronToSystemdConverter,
  "crontab-to-aws-eventbridge-converter": CronToEventBridgeConverter,
  "jwt-debugger": JwtDebugger,
  "jwt-payload-inspector-signer": JwtInspector,
  "curl-to-fetch-converter": CurlToFetchConverter,
  "curl-to-python-requests-converter": CurlToPythonConverter,
  "curl-to-javascript-axios-converter": CurlToAxiosConverter,
  "curl-to-php-curl-converter": CurlToPhpConverter,
  "curl-to-go-http-converter": CurlToGoConverter,
  "curl-to-ruby-net-http-converter": CurlToRubyConverter,
  "curl-to-rust-reqwest-converter": CurlToRustConverter,
  "curl-to-csharp-httpclient-converter": CurlToCSharpConverter,
  "curl-to-dart-http-converter": CurlToDartConverter,
  "curl-to-kotlin-okhttp-converter": CurlToKotlinConverter,
  "curl-to-swift-urlsession-converter": CurlToSwiftConverter,
  "curl-to-powershell-restmethod-converter": CurlToPowerShellConverter,
  "curl-to-r-httr-converter": CurlToRConverter,
  "curl-to-clojure-clj-http-converter": CurlToClojureConverter,
  "html-to-markdown-converter": HtmlToMarkdownConverter,
  "html-entity-encoder-decoder": HtmlEntityConverter,
  "regex-tester": RegexTester,
  "javascript-regex-cheat-sheet-reference": RegexReference,
  "sql-formatter": SqlFormatter,
  "sql-in-clause-batch-formatter": SqlInClauseFormatter,
  "json-to-typescript-converter": JsonToTypeScriptConverter,
  "json-schema-to-typescript-type-converter": JsonSchemaToTypeConverter,
  "json-schema-to-zod-schema-converter": JsonSchemaToZodConverter,
  "json-to-env-file-converter": JsonToEnvConverter,
  "list-cleaner-deduplicator": ListCleaner,
  "json-yaml-converter": JsonYamlConverter,
  "hex-decimal-binary-converter": BaseConverter,
  "slug-generator": SlugGenerator,
  "json-minify-compressor": JsonMinifier,
  "lorem-json-mock-data-generator": MockJsonGenerator,
  "random-string-token-generator": RandomTokenGenerator,
  "svg-path-visualizer-optimizer": SvgPathVisualizer,
  "csv-column-extractor-filter": CsvColumnExtractor,
  "url-parser-query-parameter-builder": UrlQueryParamBuilder,
  "binary-to-hex-text-ascii-translator": BinaryHexAsciiTranslator,
  "javascript-event-keycodes-reference": KeycodeVisualizer,
  "bcrypt-hash-cost-factor-benchmark": BcryptCostCalculator,
  "password-strength-entropy-meter": PasswordEntropyMeter,

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
  "home-equity-loan-heloc-calculator": HelocCalculator,
  "mortgage-amortization-schedule-visualizer": AmortizationVisualizer,
  "annuity-payout-present-value-calculator": AnnuityCalculator,
  "401k-retirement-growth-calculator": FourZeroOneKCalculator,
  "roth-ira-growth-and-contribution-calculator": RothIraCalculator,
  "backdoor-roth-ira-tax-calculator": BackdoorRothCalculator,
  "hsa-investment-growth-calculator": HsaCalculator,
  "down-payment-savings-timeline-calculator": DownPaymentCalculator,
  "cd-ladder-yield-calculator": CdLadderCalculator,
  "traditional-vs-roth-401k-calculator": TraditionalVsRothCalculator,
  "target-date-fund-allocation-calculator": TargetDateFundCalculator,
  "home-affordability-debt-to-income-calculator": HomeAffordabilityCalculator,
  "real-estate-cap-rate-noi-calculator": CapRateCalculator,
  "real-estate-cash-on-cash-return-calculator": CashOnCashCalculator,
  "real-estate-70-percent-rule-house-flipping-calculator": HouseFlippingCalculator,
  "mortgage-recast-savings-calculator": MortgageRecastCalculator,
  "land-loan-financing-calculator": LandLoanCalculator,
  "solar-panel-payback-period-calculator": SolarPaybackCalculator,
  "electric-vehicle-ev-savings-calculator": EvSavingsCalculator,
  "529-college-savings-growth-calculator": FiveTwoNineCalculator,
  "custodial-account-ugma-utma-tax-calculator": UgmaUtmaCalculator,
  "commute-cost-calculator": CommuteCostCalculator,
  "future-salary-inflation-calculator": InflationSalaryCalculator,
  "salary-inflation-calculator": SalaryInflationCalculator,
  "hourly-paycheck-overtime-calculator": HourlyPaycheckOvertimeCalculator,
  "debt-snowball-vs-avalanche-payoff-calculator": DebtPayoffCalculator,
  "credit-utilization-ratio-calculator": CreditUtilizationCalculator,
  "crypto-portfolio-profit-loss-calculator": CryptoPnlCalculator,
  "emergency-fund-runway-calculator": EmergencyFundCalculator,
  "investment-fee-expense-ratio-calculator": ExpenseRatioCalculator,
  "net-worth-milestone-tracker": NetWorthCalculator,
  "dividend-reinvestment-drip-calculator": DripCalculator,
  "discount-calculator": DiscountCalculator,
  "discount-stacking-calculator": DiscountStackingCalculator,
  "sales-margin-markup-calculator": SalesMarginMarkupCalculator,
  "vat-sales-tax-calculator": VatSalesTaxCalculator,
  "freelance-hourly-rate-calculator": FreelanceHourlyRateCalculator,
  "salary-hourly-converter": SalaryHourlyConverter,
  "salary-after-tax-take-home-calculator": TakeHomePayCalculator,
  "mortgage-payment-calculator": MortgagePaymentCalculator,
  "inflation-calculator": InflationCalculator,
  "compound-inflation-purchasing-power-calculator": PurchasingPowerCalculator,
  "tip-bill-splitter": TipBillSplitter,
  "roi-investment-calculator": RoiCalculator,
  "car-loan-affordability-calculator": CarLoanCalculator,
  "car-lease-vs-buy-calculator": LeaseVsBuyCalculator,
  "cagr-calculator": CagrCalculator,
  "compound-annual-growth-rate-matrix": CagrMatrixCalculator,
  "credit-card-payoff-calculator": CreditCardPayoffCalculator,
  "compound-savings-goal-calculator": SavingsGoalCalculator,
  "investment-doubling-rule-of-72-calculator": RuleOf72Calculator,
  "fire-financial-independence-retire-early-calculator": FireCalculator,
  "simple-moving-average-sma-calculator": SmaCalculator,

  "bmi-calculator": BmiCalculator,
  "age-calculator": AgeCalculator,
  "water-intake-calculator": WaterIntakeCalculator,
  "walking-steps-to-miles-calories-calculator": StepsToMilesConverter,
  "sleep-cycle-calculator": SleepCycleCalculator,
  "caffeine-half-life-sleep-calculator": CaffeineHalfLifeCalculator,
  "ideal-body-weight-devine-calculator": IdealBodyWeightCalculator,
  "body-fat-percentage-us-navy-calculator": BodyFatNavyCalculator,
  "macronutrient-macro-split-calculator": MacroSplitCalculator,

  "word-counter": WordCounter,
  "character-frequency-counter": CharacterFrequencyCounter,
  "working-days-calculator": WorkingDaysCalculator,
  "gpa-calculator": GpaCalculator,
  "unit-converter": UnitConverter,
  "kitchen-cooking-unit-converter": KitchenUnitConverter,
  "fuel-consumption-mpg-to-liters-converter": FuelEfficiencyConverter,
  "decimal-to-fraction-converter": DecimalFractionConverter,
  "text-cleaner-formatter": TextCleaner,
  "roman-numeral-converter": RomanNumeralConverter,
  "hours-minutes-time-duration-calculator": TimeDurationCalculator,
  "scientific-notation-to-decimal-converter": ScientificNotationConverter,

  "timezone-meeting-planner": TimezoneMeetingPlanner,
  "gas-trip-cost-calculator": GasTripCalculator,
  "time-until-countdown-timer": CountdownTimer,

  "color-converter": ColorConverter,
  "color-contrast-checker": ColorContrastChecker,
  "hex-rgb-hsl-picker": HexRgbHslPicker,
  "hex-color-shades-tints-generator": HexColorShades,
  "hex-to-rgb-linear-srgb-converter": LinearRgbConverter,
  "aspect-ratio-calculator": AspectRatioCalculator,
  "aspect-ratio-resizer": AspectRatioResizer,
  "aspect-ratio-crop-previewer": AspectRatioCropper,
  "aspect-ratio-scale-multiplier": AspectRatioMultiplier,
  "aspect-ratio-letterbox-pillarbox-previewer": AspectRatioLetterbox,
  "aspect-ratio-pixel-density-converter": AspectRatioPixelDensity,
  "aspect-ratio-scale-factor-dimension-calculator": AspectRatioScaleFactor,
  "aspect-ratio-css-object-fit-previewer": AspectRatioCssObjectFit,
  "aspect-ratio-print-dpi-resolution-calculator": AspectRatioPrintDpi,
  "aspect-ratio-css-aspect-ratio-generator": AspectRatioCssGenerator,
  "aspect-ratio-cinema-anamorphic-calculator": AspectRatioCinemaAnamorphic,
  "aspect-ratio-video-wall-led-display-calculator": AspectRatioVideoWall,
  "aspect-ratio-css-padding-hack-calculator": CssPaddingHack,
  "device-screen-dimensions-reference": DeviceDimensionsReference,
  "aspect-ratio-device-screen-dimensions-reference": DeviceDimensionsReference,
  "css-font-clamp-fluid-typography-calculator": FluidTypographyCalculator,
  "css-glassmorphism-generator": GlassmorphismGenerator,
  "css-neumorphism-soft-ui-generator": NeumorphismGenerator,
  "css-box-shadow-generator": BoxShadowGenerator,
  "css-box-reflection-generator": BoxReflectionGenerator,
  "css-custom-scrollbar-generator": ScrollbarGenerator,
  "css-stripes-and-patterns-generator": CssStripesGenerator,
  "css-conic-gradient-pie-chart-generator": ConicGradientGenerator,
  "css-mesh-gradient-generator": MeshGradientGenerator,
  "css-gradient-generator": GradientGenerator,
  "css-triangle-generator": CssTriangleGenerator,
  "css-clip-path-polygon-generator": ClipPathGenerator,
  "video-bitrate-file-size-calculator": VideoBitrateCalculator,
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
  "screen-comparator": ScreenComparator,
  "screen-aspect-ratio-comparator": ScreenAspectComparator,
  "screen-aspect-ratio-fov-calculator": ScreenFovCalculator,
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
