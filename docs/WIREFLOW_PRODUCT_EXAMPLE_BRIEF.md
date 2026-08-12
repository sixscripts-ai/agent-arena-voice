# Wireflow Product-Use-Example Brief

## Existing Workflow

The supplied **Agent Arena Product Video** workflow currently consists of a text **Brand Brief** input, a Gemini Flash Lite image-generation node that receives the brief as a prompt, a generated-image output, and a Remotion video-editor node producing a short three-second video. The workspace reports 70 credits available.

## Improvement Direction

The current workflow should become a concise product-use example rather than a generic hero-video chain. Its input should capture the specific battle format, competing models, observable evidence, desired lesson, audience, and output style. The product story should show an analyst launching an isolated Agent Arena battle, comparing evidence-first artifacts, then using the Voice companion to understand why a model won.

## Safety and Cost Boundary

Editing the workflow design does not require a generation run. The workflow must not be run until the user confirms because generation can consume Wireflow credits. The improved workflow should minimize spend by using one image-generation branch and one short (6–8 second) template video render, with no automatic retries or parallel generations.

## Submitted Workflow Update

The full improvement specification was submitted to Wireflow AI for the existing workflow. It requests a renamed **Agent Arena — Evidence Under Pressure** workflow, five concise input fields, one image-generation node, one silent eight-second Remotion render, editable captions, and thumbnail output. The explicit constraints prohibit generated benchmarks, testimonials, invented model scores, retries, parallel branches, automatic runs, and automatic voice-session behavior.

No **Run Workflow** action was used. The Wireflow assistant was still processing the canvas update when the browser connection timed out; a generation request was not started.
