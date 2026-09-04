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
const DmarcRecordGenerator = dynamic(() => import("./network/DmarcRecordGenerator").then((m) => m.DmarcRecordGenerator), { ssr: false });
const DkimRecordGenerator = dynamic(() => import("./network/DkimRecordGenerator").then((m) => m.DkimRecordGenerator), { ssr: false });
const CaaRecordGenerator = dynamic(() => import("./network/CaaRecordGenerator").then((m) => m.CaaRecordGenerator), { ssr: false });
const TlsaRecordGenerator = dynamic(() => import("./network/TlsaRecordGenerator").then((m) => m.TlsaRecordGenerator), { ssr: false });
const SrvRecordGenerator = dynamic(() => import("./network/SrvRecordGenerator").then((m) => m.SrvRecordGenerator), { ssr: false });
const ArpaZoneGenerator = dynamic(() => import("./network/ArpaZoneGenerator").then((m) => m.ArpaZoneGenerator), { ssr: false });
const NaptrRecordGenerator = dynamic(() => import("./network/NaptrRecordGenerator").then((m) => m.NaptrRecordGenerator), { ssr: false });
const HttpsRecordGenerator = dynamic(() => import("./network/HttpsRecordGenerator").then((m) => m.HttpsRecordGenerator), { ssr: false });
const LocRecordGenerator = dynamic(() => import("./network/LocRecordGenerator").then((m) => m.LocRecordGenerator), { ssr: false });
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
const CronToGitHubActionsConverter = dynamic(() => import("./developer/CronToGitHubActionsConverter").then((m) => m.CronToGitHubActionsConverter), { ssr: false });
const CronToGitLabCiConverter = dynamic(() => import("./developer/CronToGitLabCiConverter").then((m) => m.CronToGitLabCiConverter), { ssr: false });
const CronToKubernetesConverter = dynamic(() => import("./developer/CronToKubernetesConverter").then((m) => m.CronToKubernetesConverter), { ssr: false });
const CronToAzureFunctionsConverter = dynamic(() => import("./developer/CronToAzureFunctionsConverter").then((m) => m.CronToAzureFunctionsConverter), { ssr: false });
const CronToCloudWatchConverter = dynamic(() => import("./developer/CronToCloudWatchConverter").then((m) => m.CronToCloudWatchConverter), { ssr: false });
const CronToCloudSchedulerConverter = dynamic(() => import("./developer/CronToCloudSchedulerConverter").then((m) => m.CronToCloudSchedulerConverter), { ssr: false });
const CronToDatadogConverter = dynamic(() => import("./developer/CronToDatadogConverter").then((m) => m.CronToDatadogConverter), { ssr: false });
const CronToUptimeKumaConverter = dynamic(() => import("./developer/CronToUptimeKumaConverter").then((m) => m.CronToUptimeKumaConverter), { ssr: false });
const CronToBetterUptimeConverter = dynamic(() => import("./developer/CronToBetterUptimeConverter").then((m) => m.CronToBetterUptimeConverter), { ssr: false });
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
const CurlToElixirConverter = dynamic(() => import("./developer/CurlToElixirConverter").then((m) => m.CurlToElixirConverter), { ssr: false });
const CurlToScalaConverter = dynamic(() => import("./developer/CurlToScalaConverter").then((m) => m.CurlToScalaConverter), { ssr: false });
const CurlToOcamlConverter = dynamic(() => import("./developer/CurlToOcamlConverter").then((m) => m.CurlToOcamlConverter), { ssr: false });
const CurlToHaskellConverter = dynamic(() => import("./developer/CurlToHaskellConverter").then((m) => m.CurlToHaskellConverter), { ssr: false });
const CurlToZigConverter = dynamic(() => import("./developer/CurlToZigConverter").then((m) => m.CurlToZigConverter), { ssr: false });
const CurlToLuaConverter = dynamic(() => import("./developer/CurlToLuaConverter").then((m) => m.CurlToLuaConverter), { ssr: false });
const CurlToPerlConverter = dynamic(() => import("./developer/CurlToPerlConverter").then((m) => m.CurlToPerlConverter), { ssr: false });
const CurlToEzcurlConverter = dynamic(() => import("./developer/CurlToEzcurlConverter").then((m) => m.CurlToEzcurlConverter), { ssr: false });
const CurlToAkkaHttpConverter = dynamic(() => import("./developer/CurlToAkkaHttpConverter").then((m) => m.CurlToAkkaHttpConverter), { ssr: false });
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
const AnnuityImmediateDeferredCalculator = dynamic(() => import("./finance/AnnuityImmediateDeferredCalculator").then((m) => m.AnnuityImmediateDeferredCalculator), { ssr: false });
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
const HardMoneyLoanCalculator = dynamic(() => import("./finance/HardMoneyLoanCalculator").then((m) => m.HardMoneyLoanCalculator), { ssr: false });
const DscrLoanCalculator = dynamic(() => import("./finance/DscrLoanCalculator").then((m) => m.DscrLoanCalculator), { ssr: false });
const DscrStressTester = dynamic(() => import("./finance/DscrStressTester").then((m) => m.DscrStressTester), { ssr: false });
const TripleNetLeaseCalculator = dynamic(() => import("./finance/TripleNetLeaseCalculator").then((m) => m.TripleNetLeaseCalculator), { ssr: false });
const DebtYieldCalculator = dynamic(() => import("./finance/DebtYieldCalculator").then((m) => m.DebtYieldCalculator), { ssr: false });
const LoanToCostCalculator = dynamic(() => import("./finance/LoanToCostCalculator").then((m) => m.LoanToCostCalculator), { ssr: false });
const BreakEvenOccupancyCalculator = dynamic(() => import("./finance/BreakEvenOccupancyCalculator").then((m) => m.BreakEvenOccupancyCalculator), { ssr: false });
const BusinessValuationCalculator = dynamic(() => import("./finance/BusinessValuationCalculator").then((m) => m.BusinessValuationCalculator), { ssr: false });
const SaasQuickRatioCalculator = dynamic(() => import("./finance/SaasQuickRatioCalculator").then((m) => m.SaasQuickRatioCalculator), { ssr: false });
const SaasMagicNumberCalculator = dynamic(() => import("./finance/SaasMagicNumberCalculator").then((m) => m.SaasMagicNumberCalculator), { ssr: false });
const SaasBurnMultipleCalculator = dynamic(() => import("./finance/SaasBurnMultipleCalculator").then((m) => m.SaasBurnMultipleCalculator), { ssr: false });
const SaasCacPaybackCalculator = dynamic(() => import("./finance/SaasCacPaybackCalculator").then((m) => m.SaasCacPaybackCalculator), { ssr: false });
const CreWaterfallCalculator = dynamic(() => import("./finance/CreWaterfallCalculator").then((m) => m.CreWaterfallCalculator), { ssr: false });
const SaasRuleOf40Calculator = dynamic(() => import("./finance/SaasRuleOf40Calculator").then((m) => m.SaasRuleOf40Calculator), { ssr: false });
const Section83bCalculator = dynamic(() => import("./finance/Section83bCalculator").then((m) => m.Section83bCalculator), { ssr: false });
const ConvertibleNoteCalculator = dynamic(() => import("./finance/ConvertibleNoteCalculator").then((m) => m.ConvertibleNoteCalculator), { ssr: false });
const SaasNetBurnRunwayCalculator = dynamic(() => import("./finance/SaasNetBurnRunwayCalculator").then((m) => m.SaasNetBurnRunwayCalculator), { ssr: false });
const SafeNoteCalculator = dynamic(() => import("./finance/SafeNoteCalculator").then((m) => m.SafeNoteCalculator), { ssr: false });
const SepIraCalculator = dynamic(() => import("./finance/SepIraCalculator").then((m) => m.SepIraCalculator), { ssr: false });
const Solo401kCalculator = dynamic(() => import("./finance/Solo401kCalculator").then((m) => m.Solo401kCalculator), { ssr: false });
const MegaBackdoorRothCalculator = dynamic(() => import("./finance/MegaBackdoorRothCalculator").then((m) => m.MegaBackdoorRothCalculator), { ssr: false });
const QsbsExemptionCalculator = dynamic(() => import("./finance/QsbsExemptionCalculator").then((m) => m.QsbsExemptionCalculator), { ssr: false });
const WashSaleCalculator = dynamic(() => import("./finance/WashSaleCalculator").then((m) => m.WashSaleCalculator), { ssr: false });
const MortgageRecastCalculator = dynamic(() => import("./finance/MortgageRecastCalculator").then((m) => m.MortgageRecastCalculator), { ssr: false });
const LandLoanCalculator = dynamic(() => import("./finance/LandLoanCalculator").then((m) => m.LandLoanCalculator), { ssr: false });
const SolarPaybackCalculator = dynamic(() => import("./finance/SolarPaybackCalculator").then((m) => m.SolarPaybackCalculator), { ssr: false });
const EvSavingsCalculator = dynamic(() => import("./finance/EvSavingsCalculator").then((m) => m.EvSavingsCalculator), { ssr: false });
const FiveTwoNineCalculator = dynamic(() => import("./finance/FiveTwoNineCalculator").then((m) => m.FiveTwoNineCalculator), { ssr: false });
const UgmaUtmaCalculator = dynamic(() => import("./finance/UgmaUtmaCalculator").then((m) => m.UgmaUtmaCalculator), { ssr: false });
const PensionLumpSumCalculator = dynamic(() => import("./finance/PensionLumpSumCalculator").then((m) => m.PensionLumpSumCalculator), { ssr: false });
const CommuteCostCalculator = dynamic(() => import("./finance/CommuteCostCalculator").then((m) => m.CommuteCostCalculator), { ssr: false });
const FutureSalaryInflationCalculator = dynamic(() => import("./finance/InflationSalaryCalculator").then((m) => m.InflationSalaryCalculator), { ssr: false });
const RelocationSalaryCalculator = dynamic(() => import("./finance/RelocationSalaryCalculator").then((m) => m.RelocationSalaryCalculator), { ssr: false });
const SalaryInflationCalculator = dynamic(() => import("./finance/SalaryInflationCalculator").then((m) => m.SalaryInflationCalculator), { ssr: false });
const HourlyPaycheckOvertimeCalculator = dynamic(() => import("./finance/OvertimeCalculator").then((m) => m.OvertimeCalculator), { ssr: false });
const DebtPayoffCalculator = dynamic(() => import("./finance/DebtPayoffCalculator").then((m) => m.DebtPayoffCalculator), { ssr: false });
const CreditUtilizationCalculator = dynamic(() => import("./finance/CreditUtilizationCalculator").then((m) => m.CreditUtilizationCalculator), { ssr: false });
const CryptoPnlCalculator = dynamic(() => import("./finance/CryptoPnlCalculator").then((m) => m.CryptoPnlCalculator), { ssr: false });
const EmergencyFundCalculator = dynamic(() => import("./finance/EmergencyFundCalculator").then((m) => m.EmergencyFundCalculator), { ssr: false });
const ExpenseRatioCalculator = dynamic(() => import("./finance/ExpenseRatioCalculator").then((m) => m.ExpenseRatioCalculator), { ssr: false });
const NetWorthCalculator = dynamic(() => import("./finance/NetWorthCalculator").then((m) => m.NetWorthCalculator), { ssr: false });
const StudentLoanIdrCalculator = dynamic(() => import("./finance/StudentLoanIdrCalculator").then((m) => m.StudentLoanIdrCalculator), { ssr: false });
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
const Vo2MaxCalculator = dynamic(() => import("./health/Vo2MaxCalculator").then((m) => m.Vo2MaxCalculator), { ssr: false });
const OneRepMaxCalculator = dynamic(() => import("./health/OneRepMaxCalculator").then((m) => m.OneRepMaxCalculator), { ssr: false });
const MarathonPaceCalculator = dynamic(() => import("./health/MarathonPaceCalculator").then((m) => m.MarathonPaceCalculator), { ssr: false });
const KarvonenHeartRateCalculator = dynamic(() => import("./health/KarvonenHeartRateCalculator").then((m) => m.KarvonenHeartRateCalculator), { ssr: false });
const TargetHeartRateCalculator = dynamic(() => import("./health/TargetHeartRateCalculator").then((m) => m.TargetHeartRateCalculator), { ssr: false });
const HeartRateRecoveryCalculator = dynamic(() => import("./health/HeartRateRecoveryCalculator").then((m) => m.HeartRateRecoveryCalculator), { ssr: false });
const CardiacDriftCalculator = dynamic(() => import("./health/CardiacDriftCalculator").then((m) => m.CardiacDriftCalculator), { ssr: false });
const MacroSplitCalculator = dynamic(() => import("./health/MacroSplitCalculator").then((m) => m.MacroSplitCalculator), { ssr: false });
const CriticalPowerCalculator = dynamic(() => import("./health/CriticalPowerCalculator").then((m) => m.CriticalPowerCalculator), { ssr: false });
const MasRunningIntervalsCalculator = dynamic(() => import("./health/MasRunningIntervalsCalculator").then((m) => m.MasRunningIntervalsCalculator), { ssr: false });

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
const HexToRgbLinearConverter = dynamic(() => import("./creative/LinearRgbConverter").then((m) => m.LinearRgbConverter), { ssr: false });
const OklabColorGenerator = dynamic(() => import("./creative/OklabColorGenerator").then((m) => m.OklabColorGenerator), { ssr: false });
const AspectRatioCalculator = dynamic(() => import("./creative/AspectRatioCalculator").then((m) => m.AspectRatioCalculator), { ssr: false });
const AspectRatioResizer = dynamic(() => import("./creative/AspectRatioResizer").then((m) => m.AspectRatioResizer), { ssr: false });
const AspectRatioCropPreviewer = dynamic(() => import("./creative/AspectRatioCropper").then((m) => m.AspectRatioCropper), { ssr: false });
const AspectRatioMultiplier = dynamic(() => import("./creative/AspectRatioMultiplier").then((m) => m.AspectRatioMultiplier), { ssr: false });
const AspectRatioLetterbox = dynamic(() => import("./creative/LetterboxPreviewer").then((m) => m.LetterboxPreviewer), { ssr: false });
const AspectRatioPixelDensity = dynamic(() => import("./creative/PixelDensityConverter").then((m) => m.PixelDensityConverter), { ssr: false });
const AspectRatioScaleFactor = dynamic(() => import("./creative/ScaleFactorCalculator").then((m) => m.ScaleFactorCalculator), { ssr: false });
const AspectRatioCssObjectFit = dynamic(() => import("./creative/ObjectFitPreviewer").then((m) => m.ObjectFitPreviewer), { ssr: false });
const AspectRatioPrintDpi = dynamic(() => import("./creative/PrintResolutionCalculator").then((m) => m.PrintResolutionCalculator), { ssr: false });
const AspectRatioCssGenerator = dynamic(() => import("./creative/CssAspectRatioGenerator").then((m) => m.CssAspectRatioGenerator), { ssr: false });
const AspectRatioCinemaAnamorphic = dynamic(() => import("./creative/AnamorphicCalculator").then((m) => m.AnamorphicCalculator), { ssr: false });
const AspectRatioVideoWall = dynamic(() => import("./creative/VideoWallCalculator").then((m) => m.VideoWallCalculator), { ssr: false });
const AspectRatioIsometricPixel = dynamic(() => import("./creative/IsometricPixelArtCalculator").then((m) => m.IsometricPixelArtCalculator), { ssr: false });
const AspectRatioHexagonalGrid = dynamic(() => import("./creative/HexGridCalculator").then((m) => m.HexGridCalculator), { ssr: false });
const AspectRatioIsometricCube = dynamic(() => import("./creative/IsometricCubeCalculator").then((m) => m.IsometricCubeCalculator), { ssr: false });
const AspectRatioStaggeredGrid = dynamic(() => import("./creative/StaggeredIsometricGridCalculator").then((m) => m.StaggeredIsometricGridCalculator), { ssr: false });
const HexAxialCubeConverter = dynamic(() => import("./creative/HexAxialCubeConverter").then((m) => m.HexAxialCubeConverter), { ssr: false });
const HexPixelPickerCalculator = dynamic(() => import("./creative/HexPixelPickerCalculator").then((m) => m.HexPixelPickerCalculator), { ssr: false });
const HexLineDrawingCalculator = dynamic(() => import("./creative/HexLineDrawingCalculator").then((m) => m.HexLineDrawingCalculator), { ssr: false });
const HexRingSpiralGenerator = dynamic(() => import("./creative/HexRingSpiralGenerator").then((m) => m.HexRingSpiralGenerator), { ssr: false });
const HexFovShadowcastingCalculator = dynamic(() => import("./creative/HexFovShadowcastingCalculator").then((m) => m.HexFovShadowcastingCalculator), { ssr: false });
const CssPaddingHack = dynamic(() => import("./creative/CssPaddingHackCalculator").then((m) => m.CssPaddingHackCalculator), { ssr: false });
const DeviceDimensionsReference = dynamic(() => import("./creative/DeviceDimensionsReference").then((m) => m.DeviceDimensionsReference), { ssr: false });
const AspectRatioDeviceScreenDimensions = dynamic(() => import("./creative/DeviceDimensionsReference").then((m) => m.DeviceDimensionsReference), { ssr: false });
const FluidTypographyCalculator = dynamic(() => import("./creative/FluidTypographyCalculator").then((m) => m.FluidTypographyCalculator), { ssr: false });
const GlassmorphismGenerator = dynamic(() => import("./creative/GlassmorphismGenerator").then((m) => m.GlassmorphismGenerator), { ssr: false });
const NeumorphismGenerator = dynamic(() => import("./creative/NeumorphismGenerator").then((m) => m.NeumorphismGenerator), { ssr: false });
const IsometricCssGenerator = dynamic(() => import("./creative/IsometricCssGenerator").then((m) => m.IsometricCssGenerator), { ssr: false });
const CssRibbonGenerator = dynamic(() => import("./creative/CssRibbonGenerator").then((m) => m.CssRibbonGenerator), { ssr: false });
const CssCustomCheckboxGenerator = dynamic(() => import("./creative/CssCustomCheckboxGenerator").then((m) => m.CssCustomCheckboxGenerator), { ssr: false });
const CssGradientBorderGenerator = dynamic(() => import("./creative/CssGradientBorderGenerator").then((m) => m.CssGradientBorderGenerator), { ssr: false });
const CssSpotlightCardGenerator = dynamic(() => import("./creative/CssSpotlightCardGenerator").then((m) => m.CssSpotlightCardGenerator), { ssr: false });
const CssAccordionDetailsGenerator = dynamic(() => import("./creative/CssAccordionDetailsGenerator").then((m) => m.CssAccordionDetailsGenerator), { ssr: false });
const CssSwitchToggleGenerator = dynamic(() => import("./creative/CssSwitchToggleGenerator").then((m) => m.CssSwitchToggleGenerator), { ssr: false });
const CssRangeSliderGenerator = dynamic(() => import("./creative/CssRangeSliderGenerator").then((m) => m.CssRangeSliderGenerator), { ssr: false });
const CssCurvedSeparatorGenerator = dynamic(() => import("./creative/CssCurvedSeparatorGenerator").then((m) => m.CssCurvedSeparatorGenerator), { ssr: false });
const SvgDropShadowGenerator = dynamic(() => import("./creative/SvgDropShadowGenerator").then((m) => m.SvgDropShadowGenerator), { ssr: false });
const SvgPathMorpher = dynamic(() => import("./creative/SvgPathMorpher").then((m) => m.SvgPathMorpher), { ssr: false });
const SvgViewBoxCalculator = dynamic(() => import("./creative/SvgViewBoxCalculator").then((m) => m.SvgViewBoxCalculator), { ssr: false });
const SvgStrokeDasharrayAnimator = dynamic(() => import("./creative/SvgStrokeDasharrayAnimator").then((m) => m.SvgStrokeDasharrayAnimator), { ssr: false });
const SvgCircleProgressCalculator = dynamic(() => import("./creative/SvgCircleProgressCalculator").then((m) => m.SvgCircleProgressCalculator), { ssr: false });
const SvgPieDonutChartGenerator = dynamic(() => import("./creative/SvgPieDonutChartGenerator").then((m) => m.SvgPieDonutChartGenerator), { ssr: false });
const SvgSparklineGenerator = dynamic(() => import("./creative/SvgSparklineGenerator").then((m) => m.SvgSparklineGenerator), { ssr: false });
const SvgCircleTimerGenerator = dynamic(() => import("./creative/SvgCircleTimerGenerator").then((m) => m.SvgCircleTimerGenerator), { ssr: false });
const BoxShadowGenerator = dynamic(() => import("./creative/BoxShadowGenerator").then((m) => m.BoxShadowGenerator), { ssr: false });
const CssBoxShadowGenerator = dynamic(() => import("./creative/BoxShadowGenerator").then((m) => m.BoxShadowGenerator), { ssr: false });
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

const CurlToDioConverter = dynamic(() => import("./developer/CurlToDioConverter").then((m) => m.CurlToDioConverter), { ssr: false });
const ArrWaterfallBridgeCalculator = dynamic(() => import("./finance/ArrWaterfallBridgeCalculator").then((m) => m.ArrWaterfallBridgeCalculator), { ssr: false });
const CssTextStrokeGenerator = dynamic(() => import("./creative/CssTextStrokeGenerator").then((m) => m.CssTextStrokeGenerator), { ssr: false });
const HinfoRecordGenerator = dynamic(() => import("./network/HinfoRecordGenerator").then((m) => m.HinfoRecordGenerator), { ssr: false });
const VentureDebtCalculator = dynamic(() => import("./finance/VentureDebtCalculator").then((m) => m.VentureDebtCalculator), { ssr: false });
const HexMovementCostCalculator = dynamic(() => import("./creative/HexMovementCostCalculator").then((m) => m.HexMovementCostCalculator), { ssr: false });
const CronToHealthchecksConverter = dynamic(() => import("./developer/CronToHealthchecksConverter").then((m) => m.CronToHealthchecksConverter), { ssr: false });
const QsbsCapGainCalculator = dynamic(() => import("./finance/QsbsCapGainCalculator").then((m) => m.QsbsCapGainCalculator), { ssr: false });
const SvgMatrixTransformVisualizer = dynamic(() => import("./creative/SvgMatrixTransformVisualizer").then((m) => m.SvgMatrixTransformVisualizer), { ssr: false });
const RunningEconomyCalculator = dynamic(() => import("./health/RunningEconomyCalculator").then((m) => m.RunningEconomyCalculator), { ssr: false });

const CurlToFastHttpConverter = dynamic(() => import("./developer/CurlToFastHttpConverter").then((m) => m.CurlToFastHttpConverter), { ssr: false });
const LtvCacPaybackSensitivityCalculator = dynamic(() => import("./finance/LtvCacPaybackSensitivityCalculator").then((m) => m.LtvCacPaybackSensitivityCalculator), { ssr: false });
const CssBackdropFilterPlayground = dynamic(() => import("./creative/CssBackdropFilterPlayground").then((m) => m.CssBackdropFilterPlayground), { ssr: false });
const DnsNsecRecordGenerator = dynamic(() => import("./network/DnsNsecRecordGenerator").then((m) => m.DnsNsecRecordGenerator), { ssr: false });
const PreMoneyVsPostMoneySafesCalculator = dynamic(() => import("./finance/PreMoneyVsPostMoneySafesCalculator").then((m) => m.PreMoneyVsPostMoneySafesCalculator), { ssr: false });
const HexCoordinateDistanceConverter = dynamic(() => import("./creative/HexCoordinateDistanceConverter").then((m) => m.HexCoordinateDistanceConverter), { ssr: false });
const CronToPagerDutyHeartbeatConverter = dynamic(() => import("./developer/CronToPagerDutyHeartbeatConverter").then((m) => m.CronToPagerDutyHeartbeatConverter), { ssr: false });
const EstateTaxPortabilityExemptionCalculator = dynamic(() => import("./finance/EstateTaxPortabilityExemptionCalculator").then((m) => m.EstateTaxPortabilityExemptionCalculator), { ssr: false });
const SvgIsometricCubeTileGenerator = dynamic(() => import("./creative/SvgIsometricCubeTileGenerator").then((m) => m.SvgIsometricCubeTileGenerator), { ssr: false });
const CriticalVelocitySwimmingCalculator = dynamic(() => import("./health/CriticalVelocitySwimmingCalculator").then((m) => m.CriticalVelocitySwimmingCalculator), { ssr: false });

const CurlToHttpieConverter = dynamic(() => import("./developer/CurlToHttpieConverter").then((m) => m.CurlToHttpieConverter), { ssr: false });
const BurnMultipleEfficiencyCalculator = dynamic(() => import("./finance/BurnMultipleEfficiencyCalculator").then((m) => m.BurnMultipleEfficiencyCalculator), { ssr: false });
const CssFluidTypographyClampCalculator = dynamic(() => import("./creative/CssFluidTypographyClampCalculator").then((m) => m.CssFluidTypographyClampCalculator), { ssr: false });
const DnsRpzResponsePolicyZoneGenerator = dynamic(() => import("./network/DnsRpzResponsePolicyZoneGenerator").then((m) => m.DnsRpzResponsePolicyZoneGenerator), { ssr: false });
const Section83bElectionDeadlineCalculator = dynamic(() => import("./finance/Section83bElectionDeadlineCalculator").then((m) => m.Section83bElectionDeadlineCalculator), { ssr: false });
const HexGridLineDrawingAlgorithm = dynamic(() => import("./creative/HexGridLineDrawingAlgorithm").then((m) => m.HexGridLineDrawingAlgorithm), { ssr: false });
const CronToCronitorHeartbeatConverter = dynamic(() => import("./developer/CronToCronitorHeartbeatConverter").then((m) => m.CronToCronitorHeartbeatConverter), { ssr: false });
const Section179EquipmentDepreciationCalculator = dynamic(() => import("./finance/Section179EquipmentDepreciationCalculator").then((m) => m.Section179EquipmentDepreciationCalculator), { ssr: false });
const SvgNoiseTextureFilterGenerator = dynamic(() => import("./creative/SvgNoiseTextureFilterGenerator").then((m) => m.SvgNoiseTextureFilterGenerator), { ssr: false });
const LactateThresholdHeartRateCalculator = dynamic(() => import("./health/LactateThresholdHeartRateCalculator").then((m) => m.LactateThresholdHeartRateCalculator), { ssr: false });

const CurlToUrllib3Converter = dynamic(() => import("./developer/CurlToUrllib3Converter").then((m) => m.CurlToUrllib3Converter), { ssr: false });
const RuleOf40Calculator = dynamic(() => import("./finance/RuleOf40Calculator").then((m) => m.RuleOf40Calculator), { ssr: false });
const CssGridAutoFitMinmaxGenerator = dynamic(() => import("./creative/CssGridAutoFitMinmaxGenerator").then((m) => m.CssGridAutoFitMinmaxGenerator), { ssr: false });
const DnsNaptrRecordGenerator = dynamic(() => import("./network/DnsNaptrRecordGenerator").then((m) => m.DnsNaptrRecordGenerator), { ssr: false });
const SafeMfnAmendmentCalculator = dynamic(() => import("./finance/SafeMfnAmendmentCalculator").then((m) => m.SafeMfnAmendmentCalculator), { ssr: false });
const HexGridFovShadowcastingAlgorithm = dynamic(() => import("./creative/HexGridFovShadowcastingAlgorithm").then((m) => m.HexGridFovShadowcastingAlgorithm), { ssr: false });
const CronToNewRelicHeartbeatConverter = dynamic(() => import("./developer/CronToNewRelicHeartbeatConverter").then((m) => m.CronToNewRelicHeartbeatConverter), { ssr: false });
const CostSegregationCalculator = dynamic(() => import("./finance/CostSegregationCalculator").then((m) => m.CostSegregationCalculator), { ssr: false });
const SvgMeshGradientGenerator = dynamic(() => import("./creative/SvgMeshGradientGenerator").then((m) => m.SvgMeshGradientGenerator), { ssr: false });
const CyclingFtpPowerZonesCalculator = dynamic(() => import("./health/CyclingFtpPowerZonesCalculator").then((m) => m.CyclingFtpPowerZonesCalculator), { ssr: false });

const CurlToFaradayConverter = dynamic(() => import("./developer/CurlToFaradayConverter").then((m) => m.CurlToFaradayConverter), { ssr: false });
const NrrCohortDecayCalculator = dynamic(() => import("./finance/NrrCohortDecayCalculator").then((m) => m.NrrCohortDecayCalculator), { ssr: false });
const CssPerspectiveTiltCardGenerator = dynamic(() => import("./creative/CssPerspectiveTiltCardGenerator").then((m) => m.CssPerspectiveTiltCardGenerator), { ssr: false });
const DnsLocRecordGenerator = dynamic(() => import("./network/DnsLocRecordGenerator").then((m) => m.DnsLocRecordGenerator), { ssr: false });
const OptionPoolShuffleCalculator = dynamic(() => import("./finance/OptionPoolShuffleCalculator").then((m) => m.OptionPoolShuffleCalculator), { ssr: false });
const HexGridSpiralRingAlgorithm = dynamic(() => import("./creative/HexGridSpiralRingAlgorithm").then((m) => m.HexGridSpiralRingAlgorithm), { ssr: false });
const CronToSignalFxConverter = dynamic(() => import("./developer/CronToSignalFxConverter").then((m) => m.CronToSignalFxConverter), { ssr: false });
const BonusDepreciationPhaseDownCalculator = dynamic(() => import("./finance/BonusDepreciationPhaseDownCalculator").then((m) => m.BonusDepreciationPhaseDownCalculator), { ssr: false });
const SvgOrganicBlobGenerator = dynamic(() => import("./creative/SvgOrganicBlobGenerator").then((m) => m.SvgOrganicBlobGenerator), { ssr: false });
const MaximumAerobicSpeedCalculator = dynamic(() => import("./health/MaximumAerobicSpeedCalculator").then((m) => m.MaximumAerobicSpeedCalculator), { ssr: false });

const CurlToCSharpHttpClientConverter = dynamic(() => import("./developer/CurlToCSharpHttpClientConverter").then((m) => m.CurlToCSharpHttpClientConverter), { ssr: false });
const SaasCustomerHealthScoreCalculator = dynamic(() => import("./finance/SaasCustomerHealthScoreCalculator").then((m) => m.SaasCustomerHealthScoreCalculator), { ssr: false });
const CssInfiniteMarqueeTickerGenerator = dynamic(() => import("./creative/CssInfiniteMarqueeTickerGenerator").then((m) => m.CssInfiniteMarqueeTickerGenerator), { ssr: false });
const DnsSshfpRecordGenerator = dynamic(() => import("./network/DnsSshfpRecordGenerator").then((m) => m.DnsSshfpRecordGenerator), { ssr: false });
const StartupLiquidationWaterfallCalculator = dynamic(() => import("./finance/StartupLiquidationWaterfallCalculator").then((m) => m.StartupLiquidationWaterfallCalculator), { ssr: false });
const HexGridRaycastingAlgorithm = dynamic(() => import("./creative/HexGridRaycastingAlgorithm").then((m) => m.HexGridRaycastingAlgorithm), { ssr: false });
const CronToHoneycombConverter = dynamic(() => import("./developer/CronToHoneycombConverter").then((m) => m.CronToHoneycombConverter), { ssr: false });
const QsbsSection1202Calculator = dynamic(() => import("./finance/QsbsSection1202Calculator").then((m) => m.QsbsSection1202Calculator), { ssr: false });
const SvgIsometricGridGenerator = dynamic(() => import("./creative/SvgIsometricGridGenerator").then((m) => m.SvgIsometricGridGenerator), { ssr: false });
const RunningCriticalSpeedCalculator = dynamic(() => import("./health/RunningCriticalSpeedCalculator").then((m) => m.RunningCriticalSpeedCalculator), { ssr: false });

const CurlToSwiftUrlSessionConverter = dynamic(() => import("./developer/CurlToSwiftUrlSessionConverter").then((m) => m.CurlToSwiftUrlSessionConverter), { ssr: false });
const SaasGrossMarginCogsCalculator = dynamic(() => import("./finance/SaasGrossMarginCogsCalculator").then((m) => m.SaasGrossMarginCogsCalculator), { ssr: false });
const CssShimmerSkeletonGenerator = dynamic(() => import("./creative/CssShimmerSkeletonGenerator").then((m) => m.CssShimmerSkeletonGenerator), { ssr: false });
const DnsOpenPgpKeyRecordGenerator = dynamic(() => import("./network/DnsOpenPgpKeyRecordGenerator").then((m) => m.DnsOpenPgpKeyRecordGenerator), { ssr: false });
const FounderSecondarySaleCalculator = dynamic(() => import("./finance/FounderSecondarySaleCalculator").then((m) => m.FounderSecondarySaleCalculator), { ssr: false });
const HexGridAStarPathfindingAlgorithm = dynamic(() => import("./creative/HexGridAStarPathfindingAlgorithm").then((m) => m.HexGridAStarPathfindingAlgorithm), { ssr: false });
const CronToPushgatewayConverter = dynamic(() => import("./developer/CronToPushgatewayConverter").then((m) => m.CronToPushgatewayConverter), { ssr: false });
const GratTrustCalculator = dynamic(() => import("./finance/GratTrustCalculator").then((m) => m.GratTrustCalculator), { ssr: false });
const SvgOrthogonalWireGenerator = dynamic(() => import("./creative/SvgOrthogonalWireGenerator").then((m) => m.SvgOrthogonalWireGenerator), { ssr: false });
const HrvRmssdRecoveryCalculator = dynamic(() => import("./health/HrvRmssdRecoveryCalculator").then((m) => m.HrvRmssdRecoveryCalculator), { ssr: false });

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
  "dns-dmarc-record-generator": DmarcRecordGenerator,
  "dns-dkim-key-record-generator": DkimRecordGenerator,
  "dns-caa-record-generator": CaaRecordGenerator,
  "dns-tlsa-dane-record-generator": TlsaRecordGenerator,
  "dns-srv-service-record-generator": SrvRecordGenerator,
  "dns-ptr-arpa-zone-generator": ArpaZoneGenerator,
  "dns-naptr-record-generator": NaptrRecordGenerator,
  "rfc-9460-dns-https-svcb-record-generator": HttpsRecordGenerator,
  "dns-loc-geographic-location-record-generator": LocRecordGenerator,
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
  "crontab-to-github-actions-schedule-converter": CronToGitHubActionsConverter,
  "crontab-to-gitlab-ci-schedule-converter": CronToGitLabCiConverter,
  "crontab-to-kubernetes-cronjob-converter": CronToKubernetesConverter,
  "crontab-to-azure-functions-schedule-converter": CronToAzureFunctionsConverter,
  "crontab-to-cloudwatch-events-converter": CronToCloudWatchConverter,
  "crontab-to-google-cloud-scheduler-converter": CronToCloudSchedulerConverter,
  "crontab-to-datadog-synthetics-schedule-converter": CronToDatadogConverter,
  "crontab-to-uptime-kuma-monitor-converter": CronToUptimeKumaConverter,
  "crontab-to-better-uptime-heartbeat-converter": CronToBetterUptimeConverter,
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
  "curl-to-elixir-httpoison-converter": CurlToElixirConverter,
  "curl-to-scala-sttp-converter": CurlToScalaConverter,
  "curl-to-scala-akka-http-converter": CurlToAkkaHttpConverter,
  "curl-to-ocaml-cohttp-converter": CurlToOcamlConverter,
  "curl-to-ocaml-ezcurl-converter": CurlToEzcurlConverter,
  "curl-to-haskell-http-conduit-converter": CurlToHaskellConverter,
  "curl-to-zig-std-http-converter": CurlToZigConverter,
  "curl-to-lua-socket-http-converter": CurlToLuaConverter,
  "curl-to-perl-lwp-useragent-converter": CurlToPerlConverter,
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
  "json-minifier": JsonMinifier,
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
  "annuity-immediate-vs-deferred-calculator": AnnuityImmediateDeferredCalculator,
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
  "hard-money-loan-calculator": HardMoneyLoanCalculator,
  "dscr-rental-loan-calculator": DscrLoanCalculator,
  "commercial-real-estate-debt-service-coverage-ratio-stress-tester": DscrStressTester,
  "commercial-real-estate-triple-net-nnn-calculator": TripleNetLeaseCalculator,
  "real-estate-debt-yield-ratio-calculator": DebtYieldCalculator,
  "commercial-real-estate-loan-to-cost-ltc-calculator": LoanToCostCalculator,
  "real-estate-break-even-occupancy-calculator": BreakEvenOccupancyCalculator,
  "cre-equity-waterfall-promote-distribution-calculator": CreWaterfallCalculator,
  "business-valuation-sde-ebitda-multiple-calculator": BusinessValuationCalculator,
  "saas-quick-ratio-growth-efficiency-calculator": SaasQuickRatioCalculator,
  "saas-magic-number-sales-efficiency-calculator": SaasMagicNumberCalculator,
  "saas-burn-multiple-capital-efficiency-calculator": SaasBurnMultipleCalculator,
  "saas-cac-payback-period-calculator": SaasCacPaybackCalculator,
  "saas-rule-of-40-growth-fcf-margin-calculator": SaasRuleOf40Calculator,
  "self-employed-sep-ira-contribution-calculator": SepIraCalculator,
  "solo-401k-contribution-calculator": Solo401kCalculator,
  "mega-backdoor-roth-solo-401k-calculator": MegaBackdoorRothCalculator,
  "qsbs-qualified-small-business-stock-tax-exemption-calculator": QsbsExemptionCalculator,
  "wash-sale-rule-crypto-stock-loss-disallowance-calculator": WashSaleCalculator,
  "iso-83b-election-startup-equity-tax-calculator": Section83bCalculator,
  "convertible-note-seed-round-calculator": ConvertibleNoteCalculator,
  "saas-net-burn-runway-calculator": SaasNetBurnRunwayCalculator,
  "safe-note-pre-vs-post-money-calculator": SafeNoteCalculator,
  "mortgage-recast-savings-calculator": MortgageRecastCalculator,
  "land-loan-financing-calculator": LandLoanCalculator,
  "solar-panel-payback-period-calculator": SolarPaybackCalculator,
  "electric-vehicle-ev-savings-calculator": EvSavingsCalculator,
  "529-college-savings-growth-calculator": FiveTwoNineCalculator,
  "custodial-account-ugma-utma-tax-calculator": UgmaUtmaCalculator,
  "pension-lump-sum-vs-annuity-calculator": PensionLumpSumCalculator,
  "commute-cost-calculator": CommuteCostCalculator,
  "future-salary-inflation-calculator": FutureSalaryInflationCalculator,
  "cost-of-living-relocation-calculator": RelocationSalaryCalculator,
  "salary-inflation-calculator": SalaryInflationCalculator,
  "hourly-paycheck-overtime-calculator": HourlyPaycheckOvertimeCalculator,
  "debt-snowball-vs-avalanche-payoff-calculator": DebtPayoffCalculator,
  "credit-utilization-ratio-calculator": CreditUtilizationCalculator,
  "crypto-portfolio-profit-loss-calculator": CryptoPnlCalculator,
  "emergency-fund-runway-calculator": EmergencyFundCalculator,
  "investment-fee-expense-ratio-calculator": ExpenseRatioCalculator,
  "net-worth-milestone-tracker": NetWorthCalculator,
  "student-loan-idr-save-calculator": StudentLoanIdrCalculator,
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
  "vo2-max-running-fitness-calculator": Vo2MaxCalculator,
  "one-rep-max-calculator": OneRepMaxCalculator,
  "pace-splits-marathon-calculator": MarathonPaceCalculator,
  "heart-rate-reserve-karvonen-calculator": KarvonenHeartRateCalculator,
  "target-heart-rate-zone-calculator": TargetHeartRateCalculator,
  "heart-rate-recovery-hrr-fitness-calculator": HeartRateRecoveryCalculator,
  "aerobic-decoupling-cardiac-drift-calculator": CardiacDriftCalculator,
  "macronutrient-macro-split-calculator": MacroSplitCalculator,
  "critical-power-w-prime-anaerobic-capacity-calculator": CriticalPowerCalculator,
  "maximum-aerobic-speed-mas-running-intervals-calculator": MasRunningIntervalsCalculator,

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
  "hex-to-rgb-linear-srgb-converter": HexToRgbLinearConverter,
  "oklab-color-palette-generator": OklabColorGenerator,
  "aspect-ratio-calculator": AspectRatioCalculator,
  "aspect-ratio-resizer": AspectRatioResizer,
  "aspect-ratio-crop-previewer": AspectRatioCropPreviewer,
  "aspect-ratio-multiplier": AspectRatioMultiplier,
  "aspect-ratio-letterbox-pillarbox-previewer": AspectRatioLetterbox,
  "aspect-ratio-pixel-density-converter": AspectRatioPixelDensity,
  "aspect-ratio-scale-factor-dimension-calculator": AspectRatioScaleFactor,
  "aspect-ratio-css-object-fit-previewer": AspectRatioCssObjectFit,
  "aspect-ratio-print-dpi-resolution-calculator": AspectRatioPrintDpi,
  "aspect-ratio-css-aspect-ratio-generator": AspectRatioCssGenerator,
  "aspect-ratio-cinema-anamorphic-calculator": AspectRatioCinemaAnamorphic,
  "aspect-ratio-video-wall-led-display-calculator": AspectRatioVideoWall,
  "aspect-ratio-isometric-pixel-art-grid-calculator": AspectRatioIsometricPixel,
  "aspect-ratio-hexagonal-grid-calculator": AspectRatioHexagonalGrid,
  "aspect-ratio-isometric-cube-grid-calculator": AspectRatioIsometricCube,
  "aspect-ratio-staggered-isometric-brick-grid-calculator": AspectRatioStaggeredGrid,
  "aspect-ratio-hexagonal-axial-to-cube-converter": HexAxialCubeConverter,
  "aspect-ratio-hexagonal-pixel-to-hex-picker": HexPixelPickerCalculator,
  "aspect-ratio-hexagonal-line-drawing-supercover-calculator": HexLineDrawingCalculator,
  "hex-grid-ring-spiral-coordinate-generator": HexRingSpiralGenerator,
  "hex-grid-field-of-view-shadowcasting-calculator": HexFovShadowcastingCalculator,
  "aspect-ratio-css-padding-hack-calculator": CssPaddingHack,
  "device-screen-dimensions-reference": DeviceDimensionsReference,
  "aspect-ratio-device-screen-dimensions-reference": DeviceDimensionsReference,
  "css-font-clamp-fluid-typography-calculator": FluidTypographyCalculator,
  "css-glassmorphism-generator": GlassmorphismGenerator,
  "css-neumorphism-soft-ui-generator": NeumorphismGenerator,
  "css-isometric-text-and-box-generator": IsometricCssGenerator,
  "css-ribbon-banner-generator": CssRibbonGenerator,
  "css-custom-checkbox-and-radio-generator": CssCustomCheckboxGenerator,
  "css-animated-gradient-border-generator": CssGradientBorderGenerator,
  "css-spotlight-mouse-hover-generator": CssSpotlightCardGenerator,
  "css-accordion-smooth-details-generator": CssAccordionDetailsGenerator,
  "css-custom-switch-toggle-generator": CssSwitchToggleGenerator,
  "pure-css-custom-range-slider-generator": CssRangeSliderGenerator,
  "css-curved-section-separator-generator": CssCurvedSeparatorGenerator,
  "svg-drop-shadow-filter-generator": SvgDropShadowGenerator,
  "svg-path-morphing-interpolator": SvgPathMorpher,
  "svg-viewbox-aspect-ratio-slicer": SvgViewBoxCalculator,
  "svg-stroke-dasharray-animator": SvgStrokeDasharrayAnimator,
  "svg-circle-progress-ring-calculator": SvgCircleProgressCalculator,
  "svg-pie-donut-chart-generator": SvgPieDonutChartGenerator,
  "svg-sparkline-micro-chart-generator": SvgSparklineGenerator,
  "svg-dashed-stroke-circle-timer-generator": SvgCircleTimerGenerator,
  "box-shadow-generator": BoxShadowGenerator,
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

  "curl-to-dart-dio-converter": CurlToDioConverter,
  "arr-waterfall-bridge-ebitda-calculator": ArrWaterfallBridgeCalculator,
  "css-text-stroke-hollow-outline-generator": CssTextStrokeGenerator,
  "dns-hinfo-hardware-os-record-generator": HinfoRecordGenerator,
  "venture-debt-warrant-coverage-calculator": VentureDebtCalculator,
  "hex-grid-movement-range-cost-calculator": HexMovementCostCalculator,
  "crontab-to-healthchecks-io-heartbeat-converter": CronToHealthchecksConverter,
  "qualified-small-business-stock-gain-exclusion-cap-calculator": QsbsCapGainCalculator,
  "svg-matrix-transformation-visualizer": SvgMatrixTransformVisualizer,
  "running-economy-aerobic-cost-calculator": RunningEconomyCalculator,

  "curl-to-go-fasthttp-converter": CurlToFastHttpConverter,
  "saas-ltv-cac-payback-sensitivity-matrix-calculator": LtvCacPaybackSensitivityCalculator,
  "css-backdrop-filter-blur-glass-playground": CssBackdropFilterPlayground,
  "dnssec-nsec-authenticated-denial-of-existence-generator": DnsNsecRecordGenerator,
  "pre-money-vs-post-money-safe-dilution-stack-calculator": PreMoneyVsPostMoneySafesCalculator,
  "hex-grid-coordinate-system-converter-distance-calculator": HexCoordinateDistanceConverter,
  "crontab-to-pagerduty-heartbeat-dead-mans-switch-converter": CronToPagerDutyHeartbeatConverter,
  "estate-tax-portability-dsue-unified-credit-calculator": EstateTaxPortabilityExemptionCalculator,
  "svg-isometric-cube-3d-tile-generator": SvgIsometricCubeTileGenerator,
  "critical-swim-speed-css-aerobic-pace-calculator": CriticalVelocitySwimmingCalculator,

  "curl-to-httpie-converter": CurlToHttpieConverter,
  "saas-burn-multiple-efficiency-runway-calculator": BurnMultipleEfficiencyCalculator,
  "css-fluid-typography-clamp-calculator": CssFluidTypographyClampCalculator,
  "dns-rpz-response-policy-zone-generator": DnsRpzResponsePolicyZoneGenerator,
  "section-83b-election-deadline-tax-calculator": Section83bElectionDeadlineCalculator,
  "hex-grid-line-drawing-raycasting-algorithm": HexGridLineDrawingAlgorithm,
  "crontab-to-cronitor-heartbeat-monitor-converter": CronToCronitorHeartbeatConverter,
  "section-179-equipment-depreciation-deduction-calculator": Section179EquipmentDepreciationCalculator,
  "svg-fe-turbulence-noise-texture-generator": SvgNoiseTextureFilterGenerator,
  "lactate-threshold-heart-rate-lthr-zones-calculator": LactateThresholdHeartRateCalculator,

  "curl-to-python-urllib3-pool-converter": CurlToUrllib3Converter,
  "rule-of-40-saas-efficiency-growth-margin-calculator": RuleOf40Calculator,
  "css-grid-auto-fit-minmax-responsive-layout-generator": CssGridAutoFitMinmaxGenerator,
  "dns-naptr-enum-sip-telephony-record-generator": DnsNaptrRecordGenerator,
  "safe-mfn-most-favored-nation-clause-calculator": SafeMfnAmendmentCalculator,
  "hex-grid-field-of-view-shadowcasting-algorithm": HexGridFovShadowcastingAlgorithm,
  "crontab-to-new-relic-synthetics-heartbeat-converter": CronToNewRelicHeartbeatConverter,
  "cost-segregation-bonus-depreciation-tax-calculator": CostSegregationCalculator,
  "svg-radial-mesh-gradient-patch-generator": SvgMeshGradientGenerator,
  "cycling-ftp-power-zones-coggan-calculator": CyclingFtpPowerZonesCalculator,

  "curl-to-ruby-faraday-client-converter": CurlToFaradayConverter,
  "saas-nrr-cohort-decay-revenue-expansion-calculator": NrrCohortDecayCalculator,
  "css-3d-perspective-card-tilt-generator": CssPerspectiveTiltCardGenerator,
  "dns-loc-geographic-coordinates-record-generator": DnsLocRecordGenerator,
  "option-pool-shuffle-dilution-calculator": OptionPoolShuffleCalculator,
  "hex-grid-spiral-ring-traversal-algorithm": HexGridSpiralRingAlgorithm,
  "crontab-to-splunk-signalfx-heartbeat-converter": CronToSignalFxConverter,
  "bonus-depreciation-tcja-phase-down-schedule-calculator": BonusDepreciationPhaseDownCalculator,
  "svg-smooth-organic-blob-generator": SvgOrganicBlobGenerator,
  "maximum-aerobic-speed-mas-aerobic-intervals-calculator": MaximumAerobicSpeedCalculator,
  "curl-to-csharp-dotnet-httpclient-converter": CurlToCSharpHttpClientConverter,
  "saas-customer-health-score-churn-risk-calculator": SaasCustomerHealthScoreCalculator,
  "css-infinite-marquee-ticker-generator": CssInfiniteMarqueeTickerGenerator,
  "dns-sshfp-ssh-fingerprint-record-generator": DnsSshfpRecordGenerator,
  "startup-liquidation-preference-waterfall-calculator": StartupLiquidationWaterfallCalculator,
  "hex-grid-line-of-sight-raycasting-algorithm": HexGridRaycastingAlgorithm,
  "crontab-to-honeycomb-marker-telemetry-converter": CronToHoneycombConverter,
  "qsbs-section-1202-capital-gains-exclusion-calculator": QsbsSection1202Calculator,
  "svg-isometric-3d-grid-projection-generator": SvgIsometricGridGenerator,
  "running-critical-speed-d-prime-aerobic-model-calculator": RunningCriticalSpeedCalculator,
  "curl-to-swift-urlsession-async-await-converter": CurlToSwiftUrlSessionConverter,
  "saas-gross-margin-cogs-unit-economics-calculator": SaasGrossMarginCogsCalculator,
  "css-shimmer-skeleton-loading-effect-generator": CssShimmerSkeletonGenerator,
  "dns-openpgpkey-email-encryption-record-generator": DnsOpenPgpKeyRecordGenerator,
  "founder-secondary-sale-equity-dilution-calculator": FounderSecondarySaleCalculator,
  "hex-grid-a-star-pathfinding-algorithm": HexGridAStarPathfindingAlgorithm,
  "crontab-to-prometheus-pushgateway-exporter": CronToPushgatewayConverter,
  "grantor-retained-annuity-trust-grat-calculator": GratTrustCalculator,
  "svg-orthogonal-flowchart-wire-connector-generator": SvgOrthogonalWireGenerator,
  "hrv-rmssd-autonomic-recovery-score-calculator": HrvRmssdRecoveryCalculator,
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
