import React, { ChangeEvent } from "react";
import { StateService } from "../service/StateService.js";
import Signal from "./Signal.js";

export default () => {
  const path = window.location.pathname.split("/").filter(x => x);

  if (!path.length || !path[0]) {
    const defaultGatewayId = StateService.Gateways[0].Id;

    // window.location.href = `/${defaultGatewayId}/signal`;
    window.history.pushState(null, "", `/${defaultGatewayId}/signal`);

    return;
  }

  if (!path[1]) {
    StateService.SetGateway(path[0]);
    // window.location.href = `/${path[0]}/signal`;
    window.history.pushState(null, "", `/${path[0]}/signal`);
    return;
  }

  const gatewayId = path[0];
  const view = path[1];

  let viewComponent = <div>Unknown</div>;

  switch (view) {
    case "signal":
      viewComponent = <Signal />;
  }

  function changeGateway(event: ChangeEvent<HTMLSelectElement>): void {
    StateService.SetGateway(path[0]);
    // window.location.href = `/${event.target.value}/${view}`;
    window.history.pushState(null, "", `/${event.target.value}/${view}`);
  }

  return [
    <header key="header" data-bs-theme="dark">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">mt-stats</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">Carousel
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Link</a>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true">Disabled</a>
              </li>
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
    </header>,
    <main style={{ marginTop: 56 }} key="main">

      {viewComponent}

      <footer className="container">
        <p className="float-end"><a href="#">Back to top</a></p>
      </footer>
    </main>
  ];
};