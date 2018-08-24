import * as React from 'react';
//import { findDOMNode } from 'react-dom';
import * as ReactDom from 'react-dom';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import {Subscription} from 'rxjs/Subscription';

import { Activity, IBotConnection, User, DirectLine, DirectLineOptions, CardActionTypes } from 'botframework-directlinejs';
import { createStore, ChatActions, sendMessage } from './Store';
import { Provider } from 'react-redux';
import { SpeechOptions } from './SpeechOptions';
import { Speech } from './SpeechModule';
import { ActivityOrID, FormatOptions } from './Types';
import * as konsole from './Konsole';
import { getTabIndex } from './getTabIndex';

export interface ChatProps {
    adaptiveCardsHostConfig: any,
    chatTitle?: boolean | string,
    user: User,
    bot: User,
    botConnection?: IBotConnection,
    directLine?: DirectLineOptions,
    speechOptions?: SpeechOptions,
    locale?: string,
    selectedActivity?: BehaviorSubject<ActivityOrID>,
    sendTyping?: boolean,
    showUploadButton?: boolean,
    formatOptions?: FormatOptions,
    resize?: 'none' | 'window' | 'detect',
    // ASKPRO - What dialog to start with
    rootDialog?: string,
    // ASKPRO - History to inject
    chatHistory?: Activity[],
    // ASKPRO - Data to send to the bot
    channelData?: any,
    // ASKPRO - To override the default blue
    themeColour?: string
}

import { History } from './History';
import { MessagePane } from './MessagePane';
import { Shell, ShellFunctions } from './Shell';

// ASKPRO -- action menu
import { ActionMenu } from './ask_pro/ActionMenu';

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();

    private botConnection: IBotConnection;

    private activitySubscription: Subscription;
    private connectionStatusSubscription: Subscription;
    private selectedActivitySubscription: Subscription;
    private shellRef: React.Component & ShellFunctions;
    private historyRef: React.Component;
    private chatviewPanelRef: HTMLElement;

    private resizeListener = () => this.setSize();

    private _handleCardAction = this.handleCardAction.bind(this);
    private _handleKeyDownCapture = this.handleKeyDownCapture.bind(this);
    private _saveChatviewPanelRef = this.saveChatviewPanelRef.bind(this);
    private _saveHistoryRef = this.saveHistoryRef.bind(this);
    private _saveShellRef = this.saveShellRef.bind(this);

    // ASKPRO - To store the theme colour
    private Theme: any;

    constructor(props: ChatProps) {
        super(props);

        konsole.log("BotChat.Chat props", props);

        // ASKPRO - Component to save styles to the page
        this.Theme = () => {
            let themeColour = this.props.themeColour || '#0078d7';
            return (
                <style dangerouslySetInnerHTML={{__html: `
                    .wc-card button {
                        color: ${themeColour};
                    }
                    .wc-card button:hover {
                        border-color: ${themeColour};
                        background-color: ${themeColour};
                    }
                    .wc-message-from-me .wc-message-content {
                        background-color: ${themeColour};
                    }
                    .wc-console.has-text .wc-send svg {
                        fill: ${themeColour};
                    }
                    .wc-console .wc-upload:hover svg {
                        fill: ${themeColour};
                    }
                `}} />
            )
        }

        this.store.dispatch<ChatActions>({
            type: 'Set_Locale',
            locale: props.locale || (window.navigator as any)["userLanguage"] || window.navigator.language || 'en'
        });

        if (props.adaptiveCardsHostConfig) {
            this.store.dispatch<ChatActions>({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }

        let { chatTitle } = props;

        if (props.formatOptions) {
            console.warn('DEPRECATED: "formatOptions.showHeader" is deprecated, use "chatTitle" instead. See https://github.com/Microsoft/BotFramework-WebChat/blob/master/CHANGELOG.md#formatoptionsshowheader-is-deprecated-use-chattitle-instead.');

            if (typeof props.formatOptions.showHeader !== 'undefined' && typeof props.chatTitle === 'undefined') {
                chatTitle = props.formatOptions.showHeader;
            }
        }

        if (typeof chatTitle !== 'undefined') {
            this.store.dispatch<ChatActions>({ type: 'Set_Chat_Title', chatTitle });
        }

        this.store.dispatch<ChatActions>({ type: 'Toggle_Upload_Button', showUploadButton: props.showUploadButton !== false });

        if (props.sendTyping) {
            this.store.dispatch<ChatActions>({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }

        if (props.speechOptions) {
            Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
            Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
        }
    }

    // ASKPRO: Used to inject history from an external source
    private injectHistory(activities: Activity[]) {
        let state = this.store.getState();
        activities.forEach(activity => {
            this.store.dispatch<ChatActions>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
        })
    }

    private handleIncomingActivity(activity: Activity) {
        console.log(activity);
        let state = this.store.getState();
        switch (activity.type) {
            case "message":
                this.store.dispatch<ChatActions>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;
            case "typing":
                if (activity.from.id !== state.connection.user.id)
                this.store.dispatch<ChatActions>({ type: 'Show_Typing', activity });
                break;
            case "event":
                if(activity.name === 'DISABLE_INPUT') {
                    this.store.dispatch<ChatActions>({type:'Set_Input_State', newState: false});
                }
                if(activity.name === 'ENABLE_INPUT') {
                    this.store.dispatch<ChatActions>({type:'Set_Input_State', newState: true});
                }
            }
        }
        
        private setSize() {
            this.store.dispatch<ChatActions>({
                type: 'Set_Size',
                width: this.chatviewPanelRef.offsetWidth,
                height: this.chatviewPanelRef.offsetHeight
            });
        }
        
        private handleCardAction() {
            // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
            // This is for after click on card action, the user press "A", it should go into the chat box
        // this.store.dispatch<ChatActions>({type:'Set_Input_State', newState: false});
        const historyDOM = ReactDom.findDOMNode(this.historyRef) as HTMLElement;

        if (historyDOM) {
            historyDOM.focus();
        }
    }

    private handleKeyDownCapture(evt: React.KeyboardEvent<HTMLDivElement>) {
        const target = evt.target as HTMLElement;
        const tabIndex = getTabIndex(target);

        if (
            evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')
        ) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }

        if (
            target === ReactDom.findDOMNode(this.historyRef)
            || typeof tabIndex !== 'number'
            || tabIndex < 0
        ) {
            evt.stopPropagation();

            let key: string;

            // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
            //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
            //         So we are manually appending the key if they can be inputted in the box
            if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
                key = inputtableKey(evt.key);
            }

            this.shellRef.focus(key);
        }
    }

    private saveChatviewPanelRef(chatviewPanelRef: HTMLElement) {
        this.chatviewPanelRef = chatviewPanelRef;
    }

    private saveHistoryRef(historyWrapper: any) {
        this.historyRef = historyWrapper && historyWrapper.getWrappedInstance();
    }

    private saveShellRef(shellWrapper: any) {
        this.shellRef = shellWrapper && shellWrapper.getWrappedInstance();
    }

    componentDidMount() {
        // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
        this.setSize();

        const botConnection = this.props.directLine
            ? (this.botConnection = new DirectLine(this.props.directLine))
            : this.props.botConnection
            ;

        if (this.props.resize === 'window')
            window.addEventListener('resize', this.resizeListener);

        this.store.dispatch<ChatActions>({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });

        // ASKPRO - Inject the history if supplied
        if (this.props.chatHistory && this.props.chatHistory.length > 0) {
            this.injectHistory(this.props.chatHistory);
        }

        // ASKPRO - Auto start if new conversation
        if(this.props.rootDialog) {
            // Start the bot at the 'skill' dialog as soon as component mounts
            if (this.props.channelData) {
                sendPostBack(botConnection, this.props.rootDialog, {}, this.props.user, '', this.props.channelData);
            } else {
                sendPostBack(botConnection, this.props.rootDialog, {}, this.props.user, '');
            }
        }

        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus =>{
                if(this.props.speechOptions && this.props.speechOptions.speechRecognizer){
                    let refGrammarId = botConnection.referenceGrammarId;
                    if(refGrammarId)
                        this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
                }
                this.store.dispatch<ChatActions>({ type: 'Connection_Change', connectionStatus })
            }
        );

        this.activitySubscription = botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => konsole.log("activity$ error", error)
        );

        if (this.props.selectedActivity) {
            this.selectedActivitySubscription = this.props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch<ChatActions>({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                });
            });
        }
    }

    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        if (this.botConnection)
            this.botConnection.end();
        window.removeEventListener('resize', this.resizeListener);
    }

    componentWillReceiveProps(nextProps: ChatProps) {
        if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
            this.store.dispatch<ChatActions>({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: nextProps.adaptiveCardsHostConfig
            });
        }

        if (this.props.showUploadButton !== nextProps.showUploadButton) {
            this.store.dispatch<ChatActions>({
                type: 'Toggle_Upload_Button',
                showUploadButton: nextProps.showUploadButton
            });
        }

        if (this.props.chatTitle !== nextProps.chatTitle) {
            this.store.dispatch<ChatActions>({
                type: 'Set_Chat_Title',
                chatTitle: nextProps.chatTitle
            });
        }
    }

    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity

    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);

        // only render real stuff after we know our dimensions
        return (
            <Provider store={ this.store }>
                <div
                    className="wc-chatview-panel"
                    onKeyDownCapture={ this._handleKeyDownCapture }
                    ref={ this._saveChatviewPanelRef }
                >
                    <this.Theme/>
                    {
                        !!state.format.chatTitle &&
                            <div className="wc-header">
                                <span>{ typeof state.format.chatTitle === 'string' ? state.format.chatTitle : state.format.strings.title }</span>
                            </div>
                    }
                    <MessagePane>
                        <History
                            onCardAction={ this._handleCardAction }
                            ref={ this._saveHistoryRef }
                        />
                    </MessagePane>
                    <Shell ref={ this._saveShellRef } />
                    {
                        this.props.resize === 'detect' &&
                            <ResizeDetector onresize={ this.resizeListener } />
                    }
                    <ActionMenu/>
                </div>
            </Provider>
        );
    }
}

export interface IDoCardAction {
    (type: CardActionTypes, value: string | object): void;
}

export const doCardAction = (
    botConnection: IBotConnection,
    from: User,
    locale: string,
    sendMessage: (value: string, user: User, locale: string) => void,
): IDoCardAction => (
    type,
    actionValue
) => {

    const text = (typeof actionValue === 'string') ? actionValue as string : undefined;
    const value = (typeof actionValue === 'object')? actionValue as object : undefined;

    switch (type) {
        case "imBack":
            if (typeof text === 'string')
                sendMessage(text, from, locale);
            break;

        case "postBack":
            sendPostBack(botConnection, text, value, from, locale);
            break;

        case "call":
        case "openUrl":
        case "playAudio":
        case "playVideo":
        case "showImage":
        case "downloadFile":
        case "signin":
            window.open(text);
            break;

        default:
            konsole.log("unknown button type", type);
        }
}

export const sendPostBack = (botConnection: IBotConnection, text: string, value: object, from: User, locale: string, channelData?: any) => {
    botConnection.postActivity({
        type: "message",
        text,
        value,
        from,
        locale,
        channelData,
    })
    .subscribe(id => {
        konsole.log("success sending postBack", id)
    }, error => {
        konsole.log("failed to send postBack", error);
    });
}

export const renderIfNonempty = (value: any, renderer: (value: any) => JSX.Element ) => {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
}

export const classList = (...args:(string | boolean)[]) => {
    return args.filter(Boolean).join(' ');
}

// note: container of this element must have CSS position of either absolute or relative
const ResizeDetector = (props: {
    onresize: () => void
}) =>
    // adapted to React from https://github.com/developit/simple-element-resize-detector
    <iframe
        style={ { position: 'absolute', left: '0', top: '-100%', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' } }
        ref={ frame => {
            if (frame)
                frame.contentWindow.onresize = props.onresize;
        } }
    />;

// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
const INPUTTABLE_KEY: { [key: string]: string } = {
    Add: '+',      // Numpad add key
    Decimal: '.',  // Numpad decimal key
    Divide: '/',   // Numpad divide key
    Multiply: '*', // Numpad multiply key
    Subtract: '-'  // Numpad subtract key
};

function inputtableKey(key: string) {
    return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
