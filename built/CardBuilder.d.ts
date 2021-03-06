import { CardAction } from 'botframework-directlinejs';
import { AdaptiveCard, CardElement, Column, Container, TextBlock } from 'adaptivecards';
export declare class AdaptiveCardBuilder {
    private container;
    card: AdaptiveCard;
    constructor();
    addColumnSet(sizes: number[], container?: Container): Column[];
    addItems(cardElements: CardElement[], container?: Container): void;
    addTextBlock(text: string, template: Partial<TextBlock>, container?: Container): void;
    addButtons(cardActions: CardAction[], interactive?: Boolean): void;
    private static addCardAction(cardAction);
    addCommon(content: ICommonContent, interactive: Boolean): void;
    addImage(url: string, container?: Container, selectAction?: CardAction): void;
}
export interface ICommonContent {
    title?: string;
    subtitle?: string;
    text?: string;
    buttons?: CardAction[];
}
export declare const buildCommonCard: (content: ICommonContent, interactive: Boolean) => AdaptiveCard;
