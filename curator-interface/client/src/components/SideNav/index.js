import {
  Analytics,
  WatsonHealthMagnify,
  Dashboard,
  UserAdmin,
} from "@carbon/icons-react";

import "./style.scss";
import { useNavigate, useParams } from "react-router-dom";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";

export default function SideMenu({ open }) {
  const navigate = useNavigate();
  const { language } = useParams();

  return (
    <SideNav expanded={open} isRail aria-label="side-navigation">
      <SideNavItems>
        <SideNavLink
          renderIcon={Analytics}
          onClick={() => navigate(`/${language}/train`)}
        >
          Intent Train Quality
        </SideNavLink>
        <SideNavLink
          renderIcon={WatsonHealthMagnify}
          onClick={() => navigate(`/${language}/intents`)}
        >
          Intent Search
        </SideNavLink>
        <SideNavLink
          renderIcon={Dashboard}
          onClick={() => navigate(`/${language}/dashboard`)}
        >
          Conversation Performance
        </SideNavLink>
        <SideNavLink
          renderIcon={UserAdmin}
          onClick={() => navigate(`/${language}/assistants`)}
        >
          Assistant Registration
        </SideNavLink>
      </SideNavItems>
    </SideNav>
  );
}
