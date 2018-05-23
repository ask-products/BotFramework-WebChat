"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Chat_1 = require("./Chat");
var react_redux_1 = require("react-redux");
var SpeechModule_1 = require("./SpeechModule");
var Store_1 = require("./Store");
// ASKPRO
var file_upload_1 = require("./ask_pro/file_upload");
var ShellContainer = (function (_super) {
    tslib_1.__extends(ShellContainer, _super);
    function ShellContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShellContainer.prototype.sendMessage = function () {
        if (this.props.inputText.trim().length > 0) {
            this.props.disableInput();
            this.props.sendMessage(this.props.inputText);
        }
    };
    ShellContainer.prototype.handleSendButtonKeyPress = function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.sendMessage();
            this.textInput.focus();
        }
    };
    ShellContainer.prototype.handleUploadButtonKeyPress = function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.fileInput.click();
        }
    };
    ShellContainer.prototype.onKeyPress = function (e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    };
    ShellContainer.prototype.onClickSend = function () {
        this.sendMessage();
    };
    ShellContainer.prototype.addPendingFiles = function (value) {
        var newpending = this.props.apUi.pendingUploads.slice(0);
        newpending.push(value);
        this.props.setUploadFiles(newpending);
    };
    ShellContainer.prototype.removePendingFiles = function (value) {
        var newpending = this.props.apUi.pendingUploads.filter(function (file) { return file !== value; });
        this.props.setUploadFiles(newpending);
    };
    ShellContainer.prototype.addErrorFiles = function (value) {
        var newerrors = this.props.apUi.erroredUploads.slice(0);
        newerrors.push(value);
        this.props.setErrorFiles(newerrors);
    };
    ShellContainer.prototype.removeErrorFiles = function (value) {
        var newerror = this.props.apUi.erroredUploads.filter(function (file) { return file !== value; });
        this.props.setErrorFiles(newerror);
    };
    ShellContainer.prototype.onChangeFile = function () {
        var _this = this;
        // set state variable holding valueas for pending upload files.
        var fileData = file_upload_1.apUriFromFiles(this.fileInput.files);
        var calls = fileData[0];
        for (var _i = 0, _a = fileData[1]; _i < _a.length; _i++) {
            var file = _a[_i];
            this.addPendingFiles(file);
        }
        this.props.setUploadState('UPLOADING');
        for (var _b = 0, calls_1 = calls; _b < calls_1.length; _b++) {
            var call = calls_1[_b];
            var attachment = [call];
            call.then(function (value) {
                _this.props.apSendFiles([value]);
                _this.removePendingFiles(value.name);
                // if all pending files are finished
                if (_this.props.apUi.pendingUploads.length === 0) {
                    _this.props.setUploadState('DEFAULT');
                }
                // reset Ui
                _this.fileInput.value = null;
                _this.textInput.focus();
            })
                .catch(function (err) {
                _this.removePendingFiles(err.file);
                _this.addErrorFiles(err.file);
                _this.props.setUploadState('ERROR');
            });
        }
    };
    ShellContainer.prototype.onTextInputFocus = function () {
        if (this.props.listeningState === Store_1.ListeningState.STARTED) {
            this.props.stopListening();
        }
    };
    ShellContainer.prototype.onClickMic = function () {
        if (this.props.listeningState === Store_1.ListeningState.STARTED) {
            this.props.stopListening();
        }
        else if (this.props.listeningState === Store_1.ListeningState.STOPPED) {
            this.props.startListening();
        }
    };
    ShellContainer.prototype.focus = function (appendKey) {
        this.textInput.focus();
        if (appendKey) {
            this.props.onChangeText(this.props.inputText + appendKey);
        }
    };
    ShellContainer.prototype.fileIcon = function (state) {
        switch (state) {
            case 'UPLOADING':
                return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512" },
                    React.createElement("path", { d: "M412.6 227.1L278.6 89c-5.8-6-13.7-9-22.4-9h-.4c-8.7 0-16.6 3-22.4 9l-134 138.1c-12.5 12-12.5 31.3 0 43.2 12.5 11.9 32.7 11.9 45.2 0l79.4-83v214c0 16.9 14.3 30.6 32 30.6 18 0 32-13.7 32-30.6v-214l79.4 83c12.5 11.9 32.7 11.9 45.2 0s12.5-31.2 0-43.2z" })));
            // case 'ERROR':
            //     return (
            //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            //             <path d="M278.6 256l68.2-68.2c6.2-6.2 6.2-16.4 0-22.6-6.2-6.2-16.4-6.2-22.6 0L256 233.4l-68.2-68.2c-6.2-6.2-16.4-6.2-22.6 0-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3l68.2 68.2-68.2 68.2c-3.1 3.1-4.7 7.2-4.7 11.3 0 4.1 1.6 8.2 4.7 11.3 6.2 6.2 16.4 6.2 22.6 0l68.2-68.2 68.2 68.2c6.2 6.2 16.4 6.2 22.6 0 6.2-6.2 6.2-16.4 0-22.6L278.6 256z"/>
            //         </svg>
            //     );
            default:
                return (React.createElement("svg", null,
                    React.createElement("path", { d: "M17.1739993,7.70416151 C19.4161161,5.52059528 23.0822691,5.52059528 25.3243331,7.70410998 C27.7184735,10.0341339 27.4282212,13.5644568 25.3243597,15.6098095 L15.6287879,25.048979 L14.6758693,24.1216236 L14.8354747,23.9669607 L24.3842707,14.7139495 C25.9787245,13.241131 26.215502,10.4556717 24.3800429,8.59166733 C22.6755457,6.92968323 19.8228395,6.92968323 18.1182195,8.591787 L7.28700007,19.1360817 C5.99581012,20.3932153 5.99581012,22.3963603 7.28700007,23.6090772 C8.58142055,24.8693561 10.6481765,24.8693561 11.8975833,23.6086611 L21.1690052,14.63163 C21.9542576,13.8660587 21.9542576,12.5770803 21.1690052,11.8115091 C20.3806892,11.0429512 19.0476,11.0429512 18.2591652,11.8116248 L10.0744157,19.7789766 L9.12191043,18.8520235 L9.28071807,18.6973492 L17.3103469,10.8767105 C18.6319247,9.58632427 20.787555,9.58632427 22.1091328,10.8767105 C23.4335913,12.1699093 23.4335913,14.2732298 22.1089295,15.5666269 L12.8414124,24.5916211 C10.820263,26.5607117 7.91585521,26.1828043 6.30219937,24.5949593 C4.59286478,23.0027813 4.5113578,19.9590317 6.34441985,18.2468596 L17.1739993,7.70416151 Z", id: "Shape" })));
        }
    };
    ShellContainer.prototype.uploadBadge = function (count, type) {
        var col = "#EEE";
        if (type === 'error') {
            col = "#ffccd3";
        }
        return (React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", style: { "position": "absolute", "top": "22px" }, className: 'upload-indicator' },
            React.createElement("ellipse", { cx: "8", cy: "8", rx: "8", ry: "8", fill: col }),
            React.createElement("text", { x: "4", y: "13", width: "8", height: "8", color: "%23000", fontSize: "small" }, count)));
    };
    ShellContainer.prototype.render = function () {
        var _this = this;
        var className = Chat_1.classList('wc-console', this.props.inputText.length > 0 && 'has-text', this.props.showUploadButton && 'has-upload-button');
        var showMicButton = this.props.listeningState !== Store_1.ListeningState.STOPPED || (SpeechModule_1.Speech.SpeechRecognizer.speechIsAvailable() && !this.props.inputText.length);
        var sendButtonClassName = Chat_1.classList('wc-send', showMicButton && 'hidden');
        var micButtonClassName = Chat_1.classList('wc-mic', !showMicButton && 'hidden', this.props.listeningState === Store_1.ListeningState.STARTED && 'active', this.props.listeningState !== Store_1.ListeningState.STARTED && 'inactive');
        var placeholder = this.props.listeningState === Store_1.ListeningState.STARTED ? this.props.strings.listeningIndicator : this.props.strings.consolePlaceholder;
        return (React.createElement("div", { className: className },
            this.props.apUi.pendingUploads.length > 0 && this.uploadBadge(this.props.apUi.pendingUploads.length, 'upload'),
            this.props.showUploadButton &&
                React.createElement("label", { className: "wc-upload", htmlFor: "wc-upload-input", onKeyPress: function (evt) { return _this.handleUploadButtonKeyPress(evt); }, tabIndex: 0 }, this.fileIcon(this.props.apUi.uploadState)),
            this.props.showUploadButton &&
                React.createElement("input", { id: "wc-upload-input", tabIndex: -1, type: "file", ref: function (input) { return _this.fileInput = input; }, multiple: true, onChange: function () { return _this.onChangeFile(); }, "aria-label": this.props.strings.uploadFile, role: "button", disabled: !this.props.apUi.inputState }),
            React.createElement("div", { className: "wc-textbox" },
                React.createElement("input", { type: "text", className: "wc-shellinput", ref: function (input) { return _this.textInput = input; }, autoFocus: true, value: this.props.inputText, onChange: function (_) { return _this.props.onChangeText(_this.textInput.value); }, onKeyPress: function (e) { return _this.onKeyPress(e); }, onFocus: function () { return _this.onTextInputFocus(); }, placeholder: placeholder, "aria-label": this.props.inputText ? null : placeholder, "aria-live": "polite", disabled: !this.props.apUi.inputState })),
            React.createElement("button", { className: sendButtonClassName, onClick: function () { return _this.onClickSend(); }, "aria-label": this.props.strings.send, role: "button", onKeyPress: function (evt) { return _this.handleSendButtonKeyPress(evt); }, tabIndex: 0, type: "button", disabled: !this.props.apUi.inputState },
                React.createElement("svg", null,
                    React.createElement("polygon", { id: "Combined-Shape", points: "5.01141071 6 5 14.1666484 22.1428571 16.5 5 18.8333516 5.01141071 27 29 16.5" }))),
            React.createElement("button", { className: micButtonClassName, onClick: function () { return _this.onClickMic(); }, "aria-label": this.props.strings.speak, role: "button", tabIndex: 0, type: "button", disabled: !this.props.apUi.inputState },
                React.createElement("svg", { width: "28", height: "22", viewBox: "0 0 58 58" },
                    React.createElement("path", { d: "M 44 28 C 43.448 28 43 28.447 43 29 L 43 35 C 43 42.72 36.72 49 29 49 C 21.28 49 15 42.72 15 35 L 15 29 C 15 28.447 14.552 28 14 28 C 13.448 28 13 28.447 13 29 L 13 35 C 13 43.485 19.644 50.429 28 50.949 L 28 56 L 23 56 C 22.448 56 22 56.447 22 57 C 22 57.553 22.448 58 23 58 L 35 58 C 35.552 58 36 57.553 36 57 C 36 56.447 35.552 56 35 56 L 30 56 L 30 50.949 C 38.356 50.429 45 43.484 45 35 L 45 29 C 45 28.447 44.552 28 44 28 Z" }),
                    React.createElement("path", { id: "micFilling", d: "M 28.97 44.438 L 28.97 44.438 C 23.773 44.438 19.521 40.033 19.521 34.649 L 19.521 11.156 C 19.521 5.772 23.773 1.368 28.97 1.368 L 28.97 1.368 C 34.166 1.368 38.418 5.772 38.418 11.156 L 38.418 34.649 C 38.418 40.033 34.166 44.438 28.97 44.438 Z" }),
                    React.createElement("path", { d: "M 29 46 C 35.065 46 40 41.065 40 35 L 40 11 C 40 4.935 35.065 0 29 0 C 22.935 0 18 4.935 18 11 L 18 35 C 18 41.065 22.935 46 29 46 Z M 20 11 C 20 6.037 24.038 2 29 2 C 33.962 2 38 6.037 38 11 L 38 35 C 38 39.963 33.962 44 29 44 C 24.038 44 20 39.963 20 35 L 20 11 Z" })))));
    };
    return ShellContainer;
}(React.Component));
exports.Shell = react_redux_1.connect(function (state) { return ({
    // passed down to ShellContainer
    inputText: state.shell.input,
    showUploadButton: state.format.showUploadButton,
    strings: state.format.strings,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
    listeningState: state.shell.listeningState,
    // ASK PRO
    apUi: state.apUi
}); }, {
    // passed down to ShellContainer
    onChangeText: function (input) { return ({ type: 'Update_Input', input: input, source: "text" }); },
    stopListening: function () { return ({ type: 'Listening_Stopping' }); },
    startListening: function () { return ({ type: 'Listening_Starting' }); },
    disableInput: function () { return ({ type: 'Set_Input_State', newState: false }); },
    enableInput: function () { return ({ type: 'Set_Input_State', newState: true }); },
    setUploadFiles: function (files) { return ({ type: 'Set_Upload_Files', files: files }); },
    setErrorFiles: function (files) { return ({ type: 'Set_Error_Files', files: files }); },
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage,
    sendFiles: Store_1.sendFiles,
    apSendFiles: Store_1.apSendFiles,
    setUploadState: Store_1.setUploadState
}, function (stateProps, dispatchProps, ownProps) { return ({
    // from stateProps
    inputText: stateProps.inputText,
    showUploadButton: stateProps.showUploadButton,
    strings: stateProps.strings,
    listeningState: stateProps.listeningState,
    apUi: stateProps.apUi,
    // from dispatchProps
    onChangeText: dispatchProps.onChangeText,
    // helper functions
    sendMessage: function (text) { return dispatchProps.sendMessage(text, stateProps.user, stateProps.locale); },
    sendFiles: function (files) { return dispatchProps.sendFiles(files, stateProps.user, stateProps.locale); },
    setUploadState: function (state) { return dispatchProps.setUploadState(state); },
    setUploadFiles: function (files) { return dispatchProps.setUploadFiles(files); },
    setErrorFiles: function (files) { return dispatchProps.setErrorFiles(files); },
    startListening: function () { return dispatchProps.startListening(); },
    stopListening: function () { return dispatchProps.stopListening(); },
    // ASK PRO
    apSendFiles: function (attachment) { return dispatchProps.apSendFiles(attachment, stateProps.user, stateProps.locale); },
    disableInput: function () { return dispatchProps.disableInput(); },
    enableInput: function () { return dispatchProps.disableInput(); }
}); }, {
    withRef: true
})(ShellContainer);
//# sourceMappingURL=Shell.js.map