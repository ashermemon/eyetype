import React from "react";
import KeyGrid from "../components/KeyGrid";

type Props = {};

export default function KeyboardPage({}: Props) {
  return (
    <div className="fill-page">
      <KeyGrid />
    </div>
  );
}
