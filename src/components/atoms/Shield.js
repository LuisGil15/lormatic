import React from "react";

import '../../assets/styles/components/atoms/Shield.css';

const Shield = ({value}) => {
    return (
        <div className="shield-container">
            <div className="shield-bg">
                <span className="shield-txt">{value && value}</span>
            </div>
        </div>
    );
};

export default Shield;