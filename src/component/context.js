import React from "react";

import { SampleContext } from "../App";

export default function DemoContext() {
    const name = React.useContext(SampleContext);

    return (
        <div className="card mt-5">
            <p>This Value Is Fetch Using useContext</p>
            {name[0].title + " " + name[1].amount}
        </div>
    );
}

