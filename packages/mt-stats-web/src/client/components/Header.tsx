import React, { ChangeEvent } from "react";
import { StateService } from "../service/StateService.js";
import { useNavigate, useParams } from "react-router-dom";

export const Header = () => {
    const navigate = useNavigate();
    const params = useParams();
    const gatewayId = params.gatewayId;
    const view = params.view;

    const changeGateway = (event: ChangeEvent<HTMLSelectElement>) => {
        const newGatewayId = event.target.value;

        navigate(`/${newGatewayId}/${view}`);
    };

    const views = [
        {
            Key: "signal",
            Name: "Signal"
        },
        {
            Key: "util",
            Name: "Utilisation"
        }
    ];

    return <header key="header" data-bs-theme="dark">
        <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">mt-stats</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <ul className="navbar-nav me-auto mb-2 mb-md-0">
                        {
                            views.map((x, i) => {
                                let className = "nav-link";

                                if (x.Key === view) {
                                    className += " active";
                                }

                                const route = `/${gatewayId}/${x.Key}`;

                                const click = (event: React.MouseEvent<HTMLAnchorElement>) => {
                                    event.preventDefault();
                                    navigate(route);
                                };

                                return <li key={i} className="nav-item">
                                    <a className={className} aria-current="page" href="#" onClick={click}>{x.Name}</a>
                                </li>;
                            })
                        }
                    </ul>
                    <form className="d-flex" role="search" style={{ margin: 0 }}>
                        <select className="form-select me-2" onChange={changeGateway} value={gatewayId}>
                            {
                                StateService.Gateways.map((x, i) =>
                                    <option key={i} value={x.Id}>{x.Name}</option>
                                )
                            }
                        </select>
                    </form>
                </div>
            </div>
        </nav>
    </header>;
};