"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_GUIDE_PDF_PATH = exports.ACTION_LABELS = exports.CallbackData = void 0;
const path = __importStar(require("path"));
var CallbackData;
(function (CallbackData) {
    CallbackData["TRIAL_SIGNUP"] = "trial_signup";
    CallbackData["VIDEO_MEETING"] = "video_meeting";
    CallbackData["FREE_GUIDE"] = "free_guide";
    CallbackData["ASK_QUESTION"] = "ask_question";
})(CallbackData || (exports.CallbackData = CallbackData = {}));
exports.ACTION_LABELS = {
    [CallbackData.TRIAL_SIGNUP]: 'Запись на пробный пакет (2 урока)',
    [CallbackData.VIDEO_MEETING]: 'Выбор времени для видео знакомства',
    [CallbackData.FREE_GUIDE]: 'Запрос бесплатного гайда',
    [CallbackData.ASK_QUESTION]: 'Вопрос Валерии',
};
exports.FREE_GUIDE_PDF_PATH = path.join(process.cwd(), 'assets', 'cv.pdf');
//# sourceMappingURL=index.js.map