/* eslint sort-keys: "off" */

import { HasEffectsContext } from '../../ExecutionContext';
import { NODE_INTERACTION_UNKNOWN_ASSIGNMENT, NodeInteractionCalled } from '../../NodeInteractions';
import type { ObjectPath } from '../../utils/PathTracker';
import { SymbolToStringTag, UNKNOWN_NON_ACCESSOR_PATH } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownTruthyValue } from './Expression';

const ValueProperties = Symbol('Value Properties');

interface ValueDescription {
	getLiteralValue(): LiteralValueOrUnknown;
	hasEffectsWhenCalled(interaction: NodeInteractionCalled, context: HasEffectsContext): boolean;
}

interface GlobalDescription {
	[pathKey: string]: GlobalDescription | null;
	[ValueProperties]: ValueDescription;
	__proto__: null;
}

const getTruthyLiteralValue = (): LiteralValueOrUnknown => UnknownTruthyValue;
const returnFalse = () => false;
const returnTrue = () => true;

const PURE: ValueDescription = {
	getLiteralValue: getTruthyLiteralValue,
	hasEffectsWhenCalled: returnFalse
};

const IMPURE: ValueDescription = {
	getLiteralValue: getTruthyLiteralValue,
	hasEffectsWhenCalled: returnTrue
};

// We use shortened variables to reduce file size here
/* OBJECT */
const O: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: IMPURE
};

/* PURE FUNCTION */
const PF: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: PURE
};

/* FUNCTION THAT MUTATES FIRST ARG WITHOUT TRIGGERING ACCESSORS */
const MUTATES_ARG_WITHOUT_ACCESSOR: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: {
		getLiteralValue: getTruthyLiteralValue,
		hasEffectsWhenCalled({ args }, context) {
			return (
				!args.length ||
				args[0].hasEffectsOnInteractionAtPath(
					UNKNOWN_NON_ACCESSOR_PATH,
					NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
					context
				)
			);
		}
	}
};

/* CONSTRUCTOR */
const C: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: IMPURE,
	prototype: O
};

/* PURE CONSTRUCTOR */
const PC: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: PURE,
	prototype: O
};

const ARRAY_TYPE: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: PURE,
	from: PF,
	of: PF,
	prototype: O
};

const INTL_MEMBER: GlobalDescription = {
	__proto__: null,
	[ValueProperties]: PURE,
	supportedLocalesOf: PC
};

const knownGlobals: GlobalDescription = {
	// Placeholders for global objects to avoid shape mutations
	global: O,
	globalThis: O,
	self: O,
	window: O,

	// Common globals
	__proto__: null,
	[ValueProperties]: IMPURE,
	Array: {
		__proto__: null,
		[ValueProperties]: IMPURE,
		from: O,
		isArray: PF,
		of: PF,
		prototype: O
	},
	ArrayBuffer: {
		__proto__: null,
		[ValueProperties]: PURE,
		isView: PF,
		prototype: O
	},
	Atomics: O,
	BigInt: C,
	BigInt64Array: C,
	BigUint64Array: C,
	Boolean: PC,
	constructor: C,
	DataView: PC,
	Date: {
		__proto__: null,
		[ValueProperties]: PURE,
		now: PF,
		parse: PF,
		prototype: O,
		UTC: PF
	},
	decodeURI: PF,
	decodeURIComponent: PF,
	encodeURI: PF,
	encodeURIComponent: PF,
	Error: PC,
	escape: PF,
	eval: O,
	EvalError: PC,
	Float32Array: ARRAY_TYPE,
	Float64Array: ARRAY_TYPE,
	Function: C,
	hasOwnProperty: O,
	Infinity: O,
	Int16Array: ARRAY_TYPE,
	Int32Array: ARRAY_TYPE,
	Int8Array: ARRAY_TYPE,
	isFinite: PF,
	isNaN: PF,
	isPrototypeOf: O,
	JSON: O,
	Map: PC,
	Math: {
		__proto__: null,
		[ValueProperties]: IMPURE,
		abs: PF,
		acos: PF,
		acosh: PF,
		asin: PF,
		asinh: PF,
		atan: PF,
		atan2: PF,
		atanh: PF,
		cbrt: PF,
		ceil: PF,
		clz32: PF,
		cos: PF,
		cosh: PF,
		exp: PF,
		expm1: PF,
		floor: PF,
		fround: PF,
		hypot: PF,
		imul: PF,
		log: PF,
		log10: PF,
		log1p: PF,
		log2: PF,
		max: PF,
		min: PF,
		pow: PF,
		random: PF,
		round: PF,
		sign: PF,
		sin: PF,
		sinh: PF,
		sqrt: PF,
		tan: PF,
		tanh: PF,
		trunc: PF
	},
	NaN: O,
	Number: {
		__proto__: null,
		[ValueProperties]: PURE,
		isFinite: PF,
		isInteger: PF,
		isNaN: PF,
		isSafeInteger: PF,
		parseFloat: PF,
		parseInt: PF,
		prototype: O
	},
	Object: {
		__proto__: null,
		[ValueProperties]: PURE,
		create: PF,
		// Technically those can throw in certain situations, but we ignore this as
		// code that relies on this will hopefully wrap this in a try-catch, which
		// deoptimizes everything anyway
		defineProperty: MUTATES_ARG_WITHOUT_ACCESSOR,
		defineProperties: MUTATES_ARG_WITHOUT_ACCESSOR,
		getOwnPropertyDescriptor: PF,
		getOwnPropertyNames: PF,
		getOwnPropertySymbols: PF,
		getPrototypeOf: PF,
		hasOwn: PF,
		is: PF,
		isExtensible: PF,
		isFrozen: PF,
		isSealed: PF,
		keys: PF,
		fromEntries: PF,
		entries: PF,
		prototype: O
	},
	parseFloat: PF,
	parseInt: PF,
	Promise: {
		__proto__: null,
		[ValueProperties]: IMPURE,
		all: O,
		prototype: O,
		race: O,
		reject: O,
		resolve: O
	},
	propertyIsEnumerable: O,
	Proxy: O,
	RangeError: PC,
	ReferenceError: PC,
	Reflect: O,
	RegExp: PC,
	Set: PC,
	SharedArrayBuffer: C,
	String: {
		__proto__: null,
		[ValueProperties]: PURE,
		fromCharCode: PF,
		fromCodePoint: PF,
		prototype: O,
		raw: PF
	},
	Symbol: {
		__proto__: null,
		[ValueProperties]: PURE,
		for: PF,
		keyFor: PF,
		prototype: O,
		toStringTag: {
			__proto__: null,
			[ValueProperties]: {
				getLiteralValue() {
					return SymbolToStringTag;
				},
				hasEffectsWhenCalled: returnTrue
			}
		}
	},
	SyntaxError: PC,
	toLocaleString: O,
	toString: O,
	TypeError: PC,
	Uint16Array: ARRAY_TYPE,
	Uint32Array: ARRAY_TYPE,
	Uint8Array: ARRAY_TYPE,
	Uint8ClampedArray: ARRAY_TYPE,
	// Technically, this is a global, but it needs special handling
	// undefined: ?,
	unescape: PF,
	URIError: PC,
	valueOf: O,
	WeakMap: PC,
	WeakSet: PC,

	// Additional globals shared by Node and Browser that are not strictly part of the language
	clearInterval: C,
	clearTimeout: C,
	console: O,
	Intl: {
		__proto__: null,
		[ValueProperties]: IMPURE,
		Collator: INTL_MEMBER,
		DateTimeFormat: INTL_MEMBER,
		ListFormat: INTL_MEMBER,
		NumberFormat: INTL_MEMBER,
		PluralRules: INTL_MEMBER,
		RelativeTimeFormat: INTL_MEMBER
	},
	setInterval: C,
	setTimeout: C,
	TextDecoder: C,
	TextEncoder: C,
	URL: C,
	URLSearchParams: C,

	// Browser specific globals
	AbortController: C,
	AbortSignal: C,
	addEventListener: O,
	alert: O,
	AnalyserNode: C,
	Animation: C,
	AnimationEvent: C,
	applicationCache: O,
	ApplicationCache: C,
	ApplicationCacheErrorEvent: C,
	atob: O,
	Attr: C,
	Audio: C,
	AudioBuffer: C,
	AudioBufferSourceNode: C,
	AudioContext: C,
	AudioDestinationNode: C,
	AudioListener: C,
	AudioNode: C,
	AudioParam: C,
	AudioProcessingEvent: C,
	AudioScheduledSourceNode: C,
	AudioWorkletNode: C,
	BarProp: C,
	BaseAudioContext: C,
	BatteryManager: C,
	BeforeUnloadEvent: C,
	BiquadFilterNode: C,
	Blob: C,
	BlobEvent: C,
	blur: O,
	BroadcastChannel: C,
	btoa: O,
	ByteLengthQueuingStrategy: C,
	Cache: C,
	caches: O,
	CacheStorage: C,
	cancelAnimationFrame: O,
	cancelIdleCallback: O,
	CanvasCaptureMediaStreamTrack: C,
	CanvasGradient: C,
	CanvasPattern: C,
	CanvasRenderingContext2D: C,
	ChannelMergerNode: C,
	ChannelSplitterNode: C,
	CharacterData: C,
	clientInformation: O,
	ClipboardEvent: C,
	close: O,
	closed: O,
	CloseEvent: C,
	Comment: C,
	CompositionEvent: C,
	confirm: O,
	ConstantSourceNode: C,
	ConvolverNode: C,
	CountQueuingStrategy: C,
	createImageBitmap: O,
	Credential: C,
	CredentialsContainer: C,
	crypto: O,
	Crypto: C,
	CryptoKey: C,
	CSS: C,
	CSSConditionRule: C,
	CSSFontFaceRule: C,
	CSSGroupingRule: C,
	CSSImportRule: C,
	CSSKeyframeRule: C,
	CSSKeyframesRule: C,
	CSSMediaRule: C,
	CSSNamespaceRule: C,
	CSSPageRule: C,
	CSSRule: C,
	CSSRuleList: C,
	CSSStyleDeclaration: C,
	CSSStyleRule: C,
	CSSStyleSheet: C,
	CSSSupportsRule: C,
	CustomElementRegistry: C,
	customElements: O,
	CustomEvent: C,
	DataTransfer: C,
	DataTransferItem: C,
	DataTransferItemList: C,
	defaultstatus: O,
	defaultStatus: O,
	DelayNode: C,
	DeviceMotionEvent: C,
	DeviceOrientationEvent: C,
	devicePixelRatio: O,
	dispatchEvent: O,
	document: O,
	Document: C,
	DocumentFragment: C,
	DocumentType: C,
	DOMError: C,
	DOMException: C,
	DOMImplementation: C,
	DOMMatrix: C,
	DOMMatrixReadOnly: C,
	DOMParser: C,
	DOMPoint: C,
	DOMPointReadOnly: C,
	DOMQuad: C,
	DOMRect: C,
	DOMRectReadOnly: C,
	DOMStringList: C,
	DOMStringMap: C,
	DOMTokenList: C,
	DragEvent: C,
	DynamicsCompressorNode: C,
	Element: C,
	ErrorEvent: C,
	Event: C,
	EventSource: C,
	EventTarget: C,
	external: O,
	fetch: O,
	File: C,
	FileList: C,
	FileReader: C,
	find: O,
	focus: O,
	FocusEvent: C,
	FontFace: C,
	FontFaceSetLoadEvent: C,
	FormData: C,
	frames: O,
	GainNode: C,
	Gamepad: C,
	GamepadButton: C,
	GamepadEvent: C,
	getComputedStyle: O,
	getSelection: O,
	HashChangeEvent: C,
	Headers: C,
	history: O,
	History: C,
	HTMLAllCollection: C,
	HTMLAnchorElement: C,
	HTMLAreaElement: C,
	HTMLAudioElement: C,
	HTMLBaseElement: C,
	HTMLBodyElement: C,
	HTMLBRElement: C,
	HTMLButtonElement: C,
	HTMLCanvasElement: C,
	HTMLCollection: C,
	HTMLContentElement: C,
	HTMLDataElement: C,
	HTMLDataListElement: C,
	HTMLDetailsElement: C,
	HTMLDialogElement: C,
	HTMLDirectoryElement: C,
	HTMLDivElement: C,
	HTMLDListElement: C,
	HTMLDocument: C,
	HTMLElement: C,
	HTMLEmbedElement: C,
	HTMLFieldSetElement: C,
	HTMLFontElement: C,
	HTMLFormControlsCollection: C,
	HTMLFormElement: C,
	HTMLFrameElement: C,
	HTMLFrameSetElement: C,
	HTMLHeadElement: C,
	HTMLHeadingElement: C,
	HTMLHRElement: C,
	HTMLHtmlElement: C,
	HTMLIFrameElement: C,
	HTMLImageElement: C,
	HTMLInputElement: C,
	HTMLLabelElement: C,
	HTMLLegendElement: C,
	HTMLLIElement: C,
	HTMLLinkElement: C,
	HTMLMapElement: C,
	HTMLMarqueeElement: C,
	HTMLMediaElement: C,
	HTMLMenuElement: C,
	HTMLMetaElement: C,
	HTMLMeterElement: C,
	HTMLModElement: C,
	HTMLObjectElement: C,
	HTMLOListElement: C,
	HTMLOptGroupElement: C,
	HTMLOptionElement: C,
	HTMLOptionsCollection: C,
	HTMLOutputElement: C,
	HTMLParagraphElement: C,
	HTMLParamElement: C,
	HTMLPictureElement: C,
	HTMLPreElement: C,
	HTMLProgressElement: C,
	HTMLQuoteElement: C,
	HTMLScriptElement: C,
	HTMLSelectElement: C,
	HTMLShadowElement: C,
	HTMLSlotElement: C,
	HTMLSourceElement: C,
	HTMLSpanElement: C,
	HTMLStyleElement: C,
	HTMLTableCaptionElement: C,
	HTMLTableCellElement: C,
	HTMLTableColElement: C,
	HTMLTableElement: C,
	HTMLTableRowElement: C,
	HTMLTableSectionElement: C,
	HTMLTemplateElement: C,
	HTMLTextAreaElement: C,
	HTMLTimeElement: C,
	HTMLTitleElement: C,
	HTMLTrackElement: C,
	HTMLUListElement: C,
	HTMLUnknownElement: C,
	HTMLVideoElement: C,
	IDBCursor: C,
	IDBCursorWithValue: C,
	IDBDatabase: C,
	IDBFactory: C,
	IDBIndex: C,
	IDBKeyRange: C,
	IDBObjectStore: C,
	IDBOpenDBRequest: C,
	IDBRequest: C,
	IDBTransaction: C,
	IDBVersionChangeEvent: C,
	IdleDeadline: C,
	IIRFilterNode: C,
	Image: C,
	ImageBitmap: C,
	ImageBitmapRenderingContext: C,
	ImageCapture: C,
	ImageData: C,
	indexedDB: O,
	innerHeight: O,
	innerWidth: O,
	InputEvent: C,
	IntersectionObserver: C,
	IntersectionObserverEntry: C,
	isSecureContext: O,
	KeyboardEvent: C,
	KeyframeEffect: C,
	length: O,
	localStorage: O,
	location: O,
	Location: C,
	locationbar: O,
	matchMedia: O,
	MediaDeviceInfo: C,
	MediaDevices: C,
	MediaElementAudioSourceNode: C,
	MediaEncryptedEvent: C,
	MediaError: C,
	MediaKeyMessageEvent: C,
	MediaKeySession: C,
	MediaKeyStatusMap: C,
	MediaKeySystemAccess: C,
	MediaList: C,
	MediaQueryList: C,
	MediaQueryListEvent: C,
	MediaRecorder: C,
	MediaSettingsRange: C,
	MediaSource: C,
	MediaStream: C,
	MediaStreamAudioDestinationNode: C,
	MediaStreamAudioSourceNode: C,
	MediaStreamEvent: C,
	MediaStreamTrack: C,
	MediaStreamTrackEvent: C,
	menubar: O,
	MessageChannel: C,
	MessageEvent: C,
	MessagePort: C,
	MIDIAccess: C,
	MIDIConnectionEvent: C,
	MIDIInput: C,
	MIDIInputMap: C,
	MIDIMessageEvent: C,
	MIDIOutput: C,
	MIDIOutputMap: C,
	MIDIPort: C,
	MimeType: C,
	MimeTypeArray: C,
	MouseEvent: C,
	moveBy: O,
	moveTo: O,
	MutationEvent: C,
	MutationObserver: C,
	MutationRecord: C,
	name: O,
	NamedNodeMap: C,
	NavigationPreloadManager: C,
	navigator: O,
	Navigator: C,
	NetworkInformation: C,
	Node: C,
	NodeFilter: O,
	NodeIterator: C,
	NodeList: C,
	Notification: C,
	OfflineAudioCompletionEvent: C,
	OfflineAudioContext: C,
	offscreenBuffering: O,
	OffscreenCanvas: C,
	open: O,
	openDatabase: O,
	Option: C,
	origin: O,
	OscillatorNode: C,
	outerHeight: O,
	outerWidth: O,
	PageTransitionEvent: C,
	pageXOffset: O,
	pageYOffset: O,
	PannerNode: C,
	parent: O,
	Path2D: C,
	PaymentAddress: C,
	PaymentRequest: C,
	PaymentRequestUpdateEvent: C,
	PaymentResponse: C,
	performance: O,
	Performance: C,
	PerformanceEntry: C,
	PerformanceLongTaskTiming: C,
	PerformanceMark: C,
	PerformanceMeasure: C,
	PerformanceNavigation: C,
	PerformanceNavigationTiming: C,
	PerformanceObserver: C,
	PerformanceObserverEntryList: C,
	PerformancePaintTiming: C,
	PerformanceResourceTiming: C,
	PerformanceTiming: C,
	PeriodicWave: C,
	Permissions: C,
	PermissionStatus: C,
	personalbar: O,
	PhotoCapabilities: C,
	Plugin: C,
	PluginArray: C,
	PointerEvent: C,
	PopStateEvent: C,
	postMessage: O,
	Presentation: C,
	PresentationAvailability: C,
	PresentationConnection: C,
	PresentationConnectionAvailableEvent: C,
	PresentationConnectionCloseEvent: C,
	PresentationConnectionList: C,
	PresentationReceiver: C,
	PresentationRequest: C,
	print: O,
	ProcessingInstruction: C,
	ProgressEvent: C,
	PromiseRejectionEvent: C,
	prompt: O,
	PushManager: C,
	PushSubscription: C,
	PushSubscriptionOptions: C,
	queueMicrotask: O,
	RadioNodeList: C,
	Range: C,
	ReadableStream: C,
	RemotePlayback: C,
	removeEventListener: O,
	Request: C,
	requestAnimationFrame: O,
	requestIdleCallback: O,
	resizeBy: O,
	ResizeObserver: C,
	ResizeObserverEntry: C,
	resizeTo: O,
	Response: C,
	RTCCertificate: C,
	RTCDataChannel: C,
	RTCDataChannelEvent: C,
	RTCDtlsTransport: C,
	RTCIceCandidate: C,
	RTCIceTransport: C,
	RTCPeerConnection: C,
	RTCPeerConnectionIceEvent: C,
	RTCRtpReceiver: C,
	RTCRtpSender: C,
	RTCSctpTransport: C,
	RTCSessionDescription: C,
	RTCStatsReport: C,
	RTCTrackEvent: C,
	screen: O,
	Screen: C,
	screenLeft: O,
	ScreenOrientation: C,
	screenTop: O,
	screenX: O,
	screenY: O,
	ScriptProcessorNode: C,
	scroll: O,
	scrollbars: O,
	scrollBy: O,
	scrollTo: O,
	scrollX: O,
	scrollY: O,
	SecurityPolicyViolationEvent: C,
	Selection: C,
	ServiceWorker: C,
	ServiceWorkerContainer: C,
	ServiceWorkerRegistration: C,
	sessionStorage: O,
	ShadowRoot: C,
	SharedWorker: C,
	SourceBuffer: C,
	SourceBufferList: C,
	speechSynthesis: O,
	SpeechSynthesisEvent: C,
	SpeechSynthesisUtterance: C,
	StaticRange: C,
	status: O,
	statusbar: O,
	StereoPannerNode: C,
	stop: O,
	Storage: C,
	StorageEvent: C,
	StorageManager: C,
	styleMedia: O,
	StyleSheet: C,
	StyleSheetList: C,
	SubtleCrypto: C,
	SVGAElement: C,
	SVGAngle: C,
	SVGAnimatedAngle: C,
	SVGAnimatedBoolean: C,
	SVGAnimatedEnumeration: C,
	SVGAnimatedInteger: C,
	SVGAnimatedLength: C,
	SVGAnimatedLengthList: C,
	SVGAnimatedNumber: C,
	SVGAnimatedNumberList: C,
	SVGAnimatedPreserveAspectRatio: C,
	SVGAnimatedRect: C,
	SVGAnimatedString: C,
	SVGAnimatedTransformList: C,
	SVGAnimateElement: C,
	SVGAnimateMotionElement: C,
	SVGAnimateTransformElement: C,
	SVGAnimationElement: C,
	SVGCircleElement: C,
	SVGClipPathElement: C,
	SVGComponentTransferFunctionElement: C,
	SVGDefsElement: C,
	SVGDescElement: C,
	SVGDiscardElement: C,
	SVGElement: C,
	SVGEllipseElement: C,
	SVGFEBlendElement: C,
	SVGFEColorMatrixElement: C,
	SVGFEComponentTransferElement: C,
	SVGFECompositeElement: C,
	SVGFEConvolveMatrixElement: C,
	SVGFEDiffuseLightingElement: C,
	SVGFEDisplacementMapElement: C,
	SVGFEDistantLightElement: C,
	SVGFEDropShadowElement: C,
	SVGFEFloodElement: C,
	SVGFEFuncAElement: C,
	SVGFEFuncBElement: C,
	SVGFEFuncGElement: C,
	SVGFEFuncRElement: C,
	SVGFEGaussianBlurElement: C,
	SVGFEImageElement: C,
	SVGFEMergeElement: C,
	SVGFEMergeNodeElement: C,
	SVGFEMorphologyElement: C,
	SVGFEOffsetElement: C,
	SVGFEPointLightElement: C,
	SVGFESpecularLightingElement: C,
	SVGFESpotLightElement: C,
	SVGFETileElement: C,
	SVGFETurbulenceElement: C,
	SVGFilterElement: C,
	SVGForeignObjectElement: C,
	SVGGElement: C,
	SVGGeometryElement: C,
	SVGGradientElement: C,
	SVGGraphicsElement: C,
	SVGImageElement: C,
	SVGLength: C,
	SVGLengthList: C,
	SVGLinearGradientElement: C,
	SVGLineElement: C,
	SVGMarkerElement: C,
	SVGMaskElement: C,
	SVGMatrix: C,
	SVGMetadataElement: C,
	SVGMPathElement: C,
	SVGNumber: C,
	SVGNumberList: C,
	SVGPathElement: C,
	SVGPatternElement: C,
	SVGPoint: C,
	SVGPointList: C,
	SVGPolygonElement: C,
	SVGPolylineElement: C,
	SVGPreserveAspectRatio: C,
	SVGRadialGradientElement: C,
	SVGRect: C,
	SVGRectElement: C,
	SVGScriptElement: C,
	SVGSetElement: C,
	SVGStopElement: C,
	SVGStringList: C,
	SVGStyleElement: C,
	SVGSVGElement: C,
	SVGSwitchElement: C,
	SVGSymbolElement: C,
	SVGTextContentElement: C,
	SVGTextElement: C,
	SVGTextPathElement: C,
	SVGTextPositioningElement: C,
	SVGTitleElement: C,
	SVGTransform: C,
	SVGTransformList: C,
	SVGTSpanElement: C,
	SVGUnitTypes: C,
	SVGUseElement: C,
	SVGViewElement: C,
	TaskAttributionTiming: C,
	Text: C,
	TextEvent: C,
	TextMetrics: C,
	TextTrack: C,
	TextTrackCue: C,
	TextTrackCueList: C,
	TextTrackList: C,
	TimeRanges: C,
	toolbar: O,
	top: O,
	Touch: C,
	TouchEvent: C,
	TouchList: C,
	TrackEvent: C,
	TransitionEvent: C,
	TreeWalker: C,
	UIEvent: C,
	ValidityState: C,
	visualViewport: O,
	VisualViewport: C,
	VTTCue: C,
	WaveShaperNode: C,
	WebAssembly: O,
	WebGL2RenderingContext: C,
	WebGLActiveInfo: C,
	WebGLBuffer: C,
	WebGLContextEvent: C,
	WebGLFramebuffer: C,
	WebGLProgram: C,
	WebGLQuery: C,
	WebGLRenderbuffer: C,
	WebGLRenderingContext: C,
	WebGLSampler: C,
	WebGLShader: C,
	WebGLShaderPrecisionFormat: C,
	WebGLSync: C,
	WebGLTexture: C,
	WebGLTransformFeedback: C,
	WebGLUniformLocation: C,
	WebGLVertexArrayObject: C,
	WebSocket: C,
	WheelEvent: C,
	Window: C,
	Worker: C,
	WritableStream: C,
	XMLDocument: C,
	XMLHttpRequest: C,
	XMLHttpRequestEventTarget: C,
	XMLHttpRequestUpload: C,
	XMLSerializer: C,
	XPathEvaluator: C,
	XPathExpression: C,
	XPathResult: C,
	XSLTProcessor: C
};

for (const global of ['window', 'global', 'self', 'globalThis']) {
	knownGlobals[global] = knownGlobals;
}

export function getGlobalAtPath(path: ObjectPath): ValueDescription | null {
	let currentGlobal: GlobalDescription | null = knownGlobals;
	for (const pathSegment of path) {
		if (typeof pathSegment !== 'string') {
			return null;
		}
		currentGlobal = currentGlobal[pathSegment];
		if (!currentGlobal) {
			return null;
		}
	}
	return currentGlobal[ValueProperties];
}
