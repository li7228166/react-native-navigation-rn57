/// <reference types="react" />
import { EventSubscription } from '../interfaces/EventSubscription';
import { ComponentDidAppearEvent, ComponentDidDisappearEvent, NavigationButtonPressedEvent, SearchBarUpdatedEvent, SearchBarCancelPressedEvent, ModalDismissedEvent } from '../interfaces/ComponentEvents';
import { NativeEventsReceiver } from '../adapters/NativeEventsReceiver';
export declare class ComponentEventsObserver {
    private readonly nativeEventsReceiver;
    private readonly listeners;
    private alreadyRegistered;
    constructor(nativeEventsReceiver: NativeEventsReceiver);
    registerOnceForAllComponentEvents(): void;
    bindComponent(component: React.Component<any>): EventSubscription;
    unmounted(componentId: string): void;
    notifyComponentDidAppear(event: ComponentDidAppearEvent): void;
    notifyComponentDidDisappear(event: ComponentDidDisappearEvent): void;
    notifyNavigationButtonPressed(event: NavigationButtonPressedEvent): void;
    notifyModalDismissed(event: ModalDismissedEvent): void;
    notifySearchBarUpdated(event: SearchBarUpdatedEvent): void;
    notifySearchBarCancelPressed(event: SearchBarCancelPressedEvent): void;
    private triggerOnAllListenersByComponentId;
}
