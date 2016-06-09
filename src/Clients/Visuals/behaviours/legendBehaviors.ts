/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/// <reference path="../_references.ts"/>

module powerbi.visuals {
    export interface LegendBehaviorOptions {
        legendItems: D3.Selection;
        legendIcons: D3.Selection;
        clearCatcher: D3.Selection;
    }

    export class LegendBehavior implements IInteractiveBehavior {
        public static dimmedLegendColor = '#A6A6A6';
        private legendIcons;

        public bindEvents(options: LegendBehaviorOptions, selectionHandler: ISelectionHandler): void {
            let legendItems = options.legendItems;
            this.legendIcons = options.legendIcons;
            let clearCatcher = options.clearCatcher;

            InteractivityUtils.registerStandardSelectionHandler(legendItems, selectionHandler);

            clearCatcher.on('click', () => {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean): void {
            if (hasSelection) {
                this.legendIcons.style({
                    'fill': (d: LegendDataPoint) => {
                        if (!d.selected)
                            return LegendBehavior.dimmedLegendColor;   
                        else
                            return d.color;
                    }
                });
            }
            else {
                this.legendIcons.style({
                    'fill': (d: LegendDataPoint) => {
                        return d.color;
                    }
                });
            }
        }
    }
}