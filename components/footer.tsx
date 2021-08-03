import React from "react";
import { FontAwesomeIcon } from "react-fontawesome";
import { faGithub } from "fab-svg-solid";

export default function Footer(): JSX.Element {
  return (
    <>
      <div className="columns is-desktop is-multiline is-centered is-vcentered mt-5 mt-5">
        <div className="column is-one-third has-text-centered is-size-5">
          <h4 className="has-text-weight-bold">Project by K. Wajakajornrit</h4>
          <span className="icon-text">
            <h4 className="has-text-weight-bold">Contribute with us on</h4>
            <a
              href="https://github.com/bossoq/marketstatisticsaleph"
              target="_blank"
            >
              <span className="icon mr-1 ml-1">
                <FontAwesomeIcon icon={faGithub} size="1x" />
              </span>
            </a>
          </span>
        </div>
      </div>
      <script src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"></script>
      <script>{`
        kofiWidgetOverlay.draw('bossoq', {
            'type': 'floating-chat',
            'floating-chat.donateButton.text': 'Support me',
            'floating-chat.donateButton.background-color': '#00b9fe',
            'floating-chat.donateButton.text-color': '#fff'
        });
      `}</script>
    </>
  );
}
