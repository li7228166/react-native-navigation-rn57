"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_native_1 = require("react-native");
const renderer = require("react-test-renderer");
const ComponentWrapper_1 = require("./ComponentWrapper");
const Store_1 = require("./Store");
describe('ComponentWrapper', () => {
    const componentName = 'example.MyComponent';
    let store;
    let myComponentProps;
    const componentEventsObserver = { unmounted: jest.fn() };
    class MyComponent extends React.Component {
        render() {
            myComponentProps = this.props;
            if (this.props.renderCount) {
                this.props.renderCount();
            }
            return <react_native_1.Text>{this.props.text || 'Hello, World!'}</react_native_1.Text>;
        }
    }
    MyComponent.options = {
        title: 'MyComponentTitle'
    };
    class TestParent extends React.Component {
        constructor(props) {
            super(props);
            this.ChildClass = props.ChildClass;
            this.state = { propsFromState: {} };
        }
        render() {
            return (<this.ChildClass componentId='component1' {...this.state.propsFromState}/>);
        }
    }
    beforeEach(() => {
        store = new Store_1.Store();
    });
    it('must have componentId as prop', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const orig = console.error;
        console.error = (a) => a;
        expect(() => {
            renderer.create(<NavigationComponent />);
        }).toThrowError('Component example.MyComponent does not have a componentId!');
        console.error = orig;
    });
    it('wraps the component', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        expect(NavigationComponent).not.toBeInstanceOf(MyComponent);
        const tree = renderer.create(<NavigationComponent componentId={'component1'}/>);
        expect(tree.toJSON().children).toEqual(['Hello, World!']);
    });
    it('injects props from wrapper into original component', () => {
        const renderCount = jest.fn();
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<NavigationComponent componentId={'component1'} text={'yo'} renderCount={renderCount}/>);
        expect(tree.toJSON().children).toEqual(['yo']);
        expect(renderCount).toHaveBeenCalledTimes(1);
    });
    it('updates props from wrapper into original component on state change', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<TestParent ChildClass={NavigationComponent}/>);
        expect(myComponentProps.foo).toEqual(undefined);
        tree.getInstance().setState({ propsFromState: { foo: 'yo' } });
        expect(myComponentProps.foo).toEqual('yo');
    });
    it('pulls props from the store and injects them into the inner component', () => {
        store.setPropsForId('component123', { numberProp: 1, stringProp: 'hello', objectProp: { a: 2 } });
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        renderer.create(<NavigationComponent componentId={'component123'}/>);
        expect(myComponentProps).toEqual({ componentId: 'component123', numberProp: 1, stringProp: 'hello', objectProp: { a: 2 } });
    });
    it('updates props from store into inner component', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<TestParent ChildClass={NavigationComponent}/>);
        store.setPropsForId('component1', { myProp: 'hello' });
        expect(myComponentProps.foo).toEqual(undefined);
        expect(myComponentProps.myProp).toEqual(undefined);
        tree.getInstance().setState({ propsFromState: { foo: 'yo' } });
        expect(myComponentProps.foo).toEqual('yo');
        expect(myComponentProps.myProp).toEqual('hello');
    });
    it('protects id from change', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<TestParent ChildClass={NavigationComponent}/>);
        expect(myComponentProps.componentId).toEqual('component1');
        tree.getInstance().setState({ propsFromState: { id: 'ERROR' } });
        expect(myComponentProps.componentId).toEqual('component1');
    });
    it('assignes key by id', () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<NavigationComponent componentId={'component1'}/>);
        expect(myComponentProps.componentId).toEqual('component1');
        expect(tree.getInstance()._reactInternalInstance.child.key).toEqual('component1');
    });
    it('cleans props from store on unMount', () => {
        store.setPropsForId('component123', { foo: 'bar' });
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<NavigationComponent componentId={'component123'}/>);
        expect(store.getPropsForId('component123')).toEqual({ foo: 'bar' });
        tree.unmount();
        expect(store.getPropsForId('component123')).toEqual({});
    });
    it(`merges static members from wrapped component`, () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        expect(NavigationComponent.options).toEqual({ title: 'MyComponentTitle' });
    });
    it(`calls unmounted on componentEventsObserver`, () => {
        const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, MyComponent, store, componentEventsObserver);
        const tree = renderer.create(<NavigationComponent componentId={'component123'}/>);
        expect(componentEventsObserver.unmounted).not.toHaveBeenCalled();
        tree.unmount();
        expect(componentEventsObserver.unmounted).toHaveBeenCalledTimes(1);
    });
    describe(`register with redux store`, () => {
        class MyReduxComp extends React.Component {
            static get options() {
                return { foo: 123 };
            }
            render() {
                return (<react_native_1.Text>{this.props.txt}</react_native_1.Text>);
            }
        }
        function mapStateToProps(state) {
            return {
                txt: state.txt
            };
        }
        const ConnectedComp = require('react-redux').connect(mapStateToProps)(MyReduxComp);
        const ReduxProvider = require('react-redux').Provider;
        const initialState = { txt: 'it just works' };
        const reduxStore = require('redux').createStore((state = initialState) => state);
        it(`wraps the component with a react-redux provider with passed store`, () => {
            const NavigationComponent = ComponentWrapper_1.ComponentWrapper.wrap(componentName, ConnectedComp, store, componentEventsObserver, ReduxProvider, reduxStore);
            const tree = renderer.create(<NavigationComponent componentId={'theCompId'}/>);
            expect(tree.toJSON().children).toEqual(['it just works']);
            expect(NavigationComponent.options).toEqual({ foo: 123 });
        });
    });
});
