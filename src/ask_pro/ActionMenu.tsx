import * as React from 'react';

class ActionMenu extends React.Component {
    constructor(props: ActionMenuProps){
        super(props);
    }
    render() {
        return(
            <div><p>This is the action menu.</p></div>
        )
    }
}
export default ActionMenu

interface ActionMenuProps{
    test: string
}