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

module powerbi.visuals.samples {
    import ValueFormatter = powerbi.visuals.valueFormatter;
    
    export interface ColorBarChartData {
        category: string;
        value: number;
    }
    
    export interface ColorBarChartDataView {
        values: ColorBarChartData[];
    }

    export class ColorBarChart implements IVisual {
        public static capabilities: VisualCapabilities = {
            dataRoles: [{
                displayName: 'Values',
                name: 'Values',
                kind: VisualDataRoleKind.GroupingOrMeasure
            }],
            dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 100 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                },
            }],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        fill: {
                            type: { fill: { solid: { color: true } } },
                            displayName: 'Fill'
                        },
                        size: {
                            type: { numeric: true },
                            displayName: 'Size'
                        }
                    },
                }
            },
        };

        private viewport: IViewport;
        private root: D3.Selection;
        private main: D3.Selection;
        private dataView: DataView;
        private NumberOfLabelsOnAxisY: number = 5;
        private axes: D3.Selection;
        private axisX: D3.Selection;
        private axisY: D3.Selection;
        private xAxis: D3.Svg.Axis;
        private yAxis: D3.Svg.Axis;
        //private columns: D3.Selection;
        private valueFormatter: IValueFormatter;
        private xScale: D3.Scale.OrdinalScale;
        private yScale: D3.Scale.LinearScale;
        
        private margin: IMargin = {
            top: 10,
            right: 10,
            bottom: 20,
            left: 40
        };

        public static converter(dataView: DataView): ColorBarChartDataView {
            var viewModel: ColorBarChartDataView = {
                values: []
            };
            var table = dataView.table;
            if (!table) return viewModel;
            
            for (var row of table.rows) {
                var chartData: ColorBarChartData = {
                    category: row[0],
                    value: row[1]
                };
                viewModel.values.push(chartData);
            }

            return viewModel;
        }

        public init(options: VisualInitOptions): void {
            this.root = d3.select(options.element.get(0))
                .append('svg')
                .classed('colorBarChart', true);
                
            this.main = this.root.append('g');
            
            this.axes = this.main
                .append("g")
                .classed("axes", true);

            this.axisX = this.axes
                .append("g")
                .classed("axis", true);

            this.axisY = this.axes
                .append("g")
                .classed("axis", true);
        }

        public update(options: VisualUpdateOptions) {
            if (!options.dataViews && !options.dataViews[0]) return;
            var dataView = this.dataView = options.dataViews[0];
            var viewModel: ColorBarChartDataView = ColorBarChart.converter(dataView);
            
            this.valueFormatter = ValueFormatter.create({
                value: viewModel.values[0].value,
                value2: viewModel.values[viewModel.values.length - 1].value
            });

            this.viewport = options.viewport;
            
            this.setSize(options.viewport);
        
            this.renderAxes(viewModel);
            
            this.renderColumns(viewModel);
        }
        
        private renderAxes(viewModel: ColorBarChartDataView): void {
            var valueFormatter: IValueFormatter = this.valueFormatter;

            this.xScale = d3.scale.ordinal()
                        .domain(viewModel.values.map((v: ColorBarChartData) => { return v.category; }))
                        .rangeRoundBands([0, this.viewport.width], .1);

            this.yScale = d3.scale.linear()
                      .domain(d3.extent(viewModel.values.map((v: ColorBarChartData) => { return v.value; })))
                      .range([this.viewport.height, 0]);

            this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("bottom")
                .tickValues(viewModel.values.map((v: ColorBarChartData) => { return v.category; }));

            this.yAxis = d3.svg.axis()
                .scale(this.yScale)
                .orient("left")
                .tickFormat((item: number) => valueFormatter.format(item))
                .ticks(this.NumberOfLabelsOnAxisY);

            this.axisX.call(this.xAxis);

            this.axisY.call(this.yAxis);
        }
        
        private renderColumns(viewModel: ColorBarChartDataView): void {
            /*var xScale = this.xScale;
            this.columns = this.main.append('g').selectAll('.column')
                            .data([])
                            .enter.append('svg:rect')
                            .attr('class', 'column')
                            .attr('x', (item: number) => xScale(item));*/
        }
        
        private setSize(viewport: IViewport): void {
            var height: number,
                width: number;

            height = viewport.height -
                this.margin.top -
                this.margin.bottom;

            width = viewport.width -
                this.margin.left -
                this.margin.right;

            this.viewport = {
                height: height,
                width: width
            };

            this.updateElements(viewport.height, viewport.width);
        }

        private updateElements(height: number, width: number): void {
            var shiftToRight: number = 0;

            this.root.attr({
                "height": height,
                "width": width
            });

            this.main.attr("transform", SVGUtil.translate(this.margin.left, this.margin.top));

            this.axes.attr("transform", SVGUtil.translate(shiftToRight, 0));

            this.axisX.attr(
                "transform",
                SVGUtil.translate(0, this.viewport.height));
        }

        private static getFill(dataView: DataView): Fill {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var general = objects['general'];
                    if (general) {
                        var fill = <Fill>general['fill'];
                        if (fill)
                            return fill;
                    }
                }
            }
            return { solid: { color: 'red' } };
        }

        private static getSize(dataView: DataView): number {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var general = objects['general'];
                    if (general) {
                        var size = <number>general['size'];
                        if (size)
                            return size;
                    }
                }
            }
            return 100;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            var instances: VisualObjectInstance[] = [];
            var dataView = this.dataView;
            switch (options.objectName) {
                case 'general':
                    var general: VisualObjectInstance = {
                        objectName: 'general',
                        displayName: 'General',
                        selector: null,
                        properties: {
                            fill: ColorBarChart.getFill(dataView),
                            size: ColorBarChart.getSize(dataView)
                        }
                    };
                    instances.push(general);
                    break;
            }

            return instances;
        }

        public destroy(): void {
            this.root = null;
        }
    }
}