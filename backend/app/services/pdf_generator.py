from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.lib.colors import HexColor
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import io
import base64
import os
from collections import defaultdict, Counter
import calendar

class BankStatementPDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.darkblue,
            alignment=1  # Center alignment
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor=colors.darkblue,
            borderWidth=1,
            borderColor=colors.lightgrey,
            borderPadding=5,
            backColor=colors.lightgrey
        ))
        
        self.styles.add(ParagraphStyle(
            name='HighlightBox',
            parent=self.styles['Normal'],
            fontSize=12,
            borderWidth=1,
            borderColor=colors.blue,
            borderPadding=10,
            backColor=HexColor('#f0f8ff'),
            alignment=1
        ))

    def parse_date(self, date_str):
        """Parse various date formats from bank statements"""
        try:
            # Handle format like "03JUN2025"
            if len(date_str) >= 7 and date_str[2:5].isalpha():
                day = int(date_str[:2])
                month_str = date_str[2:5].upper()
                year = int(date_str[5:])
                
                months = {
                    'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
                    'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
                }
                
                if month_str in months:
                    return datetime(year, months[month_str], day)
            
            # Handle other formats
            for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
                    
        except:
            pass
        return None

    def create_summary_cards(self, data):
        """Create summary cards section"""
        account_details = data.get('account_details', {})
        total_income = sum([t.get('amount', 0) for t in data.get('transactions', {}).get('income', [])])
        total_expenses = sum([t.get('amount', 0) for t in data.get('transactions', {}).get('expenses', [])])
        net_amount = total_income - total_expenses
        final_balance = data.get('final_balance', 0)
        
        # Create summary table
        summary_data = [
            ['Account Holder', account_details.get('name', 'N/A')],
            ['Account Number', account_details.get('account_number', 'N/A')],
            ['Currency', account_details.get('currency', 'N/A')],
            ['Statement Period', account_details.get('statement_date', 'N/A')],
            ['', ''],  # Empty row for spacing
            ['Total Income', f"{total_income:,.2f}"],
            ['Total Expenses', f"{total_expenses:,.2f}"],
            ['Net Amount', f"{net_amount:,.2f}"],
            ['Final Balance', f"{final_balance:,.2f}"]
        ]
        
        table = Table(summary_data, colWidths=[2.5*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 4), colors.lightblue),
            ('BACKGROUND', (0, 5), (-1, -1), colors.lightyellow),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        return table

    def create_monthly_chart(self, data):
        """Create monthly income vs expenses chart using matplotlib"""
        try:
            # Process monthly data
            monthly_data = defaultdict(lambda: {'income': 0, 'expenses': 0})
            
            # Process income transactions
            for transaction in data.get('transactions', {}).get('income', []):
                date_obj = self.parse_date(transaction.get('date', ''))
                if date_obj:
                    month_key = date_obj.strftime('%Y-%m')
                    monthly_data[month_key]['income'] += transaction.get('amount', 0)
            
            # Process expense transactions
            for transaction in data.get('transactions', {}).get('expenses', []):
                date_obj = self.parse_date(transaction.get('date', ''))
                if date_obj:
                    month_key = date_obj.strftime('%Y-%m')
                    monthly_data[month_key]['expenses'] += transaction.get('amount', 0)
            
            if not monthly_data:
                return None
            
            # Sort months
            sorted_months = sorted(monthly_data.keys())
            months = [datetime.strptime(m, '%Y-%m').strftime('%b %Y') for m in sorted_months]
            income_values = [monthly_data[m]['income'] for m in sorted_months]
            expense_values = [monthly_data[m]['expenses'] for m in sorted_months]
            
            # Create matplotlib chart
            fig, ax = plt.subplots(figsize=(10, 6))
            x = range(len(months))
            width = 0.35
            
            bars1 = ax.bar([i - width/2 for i in x], income_values, width, label='Income', color='#2E8B57', alpha=0.8)
            bars2 = ax.bar([i + width/2 for i in x], expense_values, width, label='Expenses', color='#CD5C5C', alpha=0.8)
            
            ax.set_xlabel('Month')
            ax.set_ylabel('Amount')
            ax.set_title('Monthly Income vs Expenses')
            ax.set_xticks(x)
            ax.set_xticklabels(months, rotation=45)
            ax.legend()
            ax.grid(True, alpha=0.3)
            
            # Add value labels on bars
            for bar in bars1:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{height:,.0f}', ha='center', va='bottom', fontsize=8)
            
            for bar in bars2:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{height:,.0f}', ha='center', va='bottom', fontsize=8)
            
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
            img_buffer.seek(0)
            plt.close()
            
            return img_buffer
            
        except Exception as e:
            print(f"Error creating monthly chart: {e}")
            return None

    def create_expense_category_chart(self, data):
        """Create expense category pie chart"""
        try:
            expenses = data.get('transactions', {}).get('expenses', [])
            if not expenses:
                return None
            
            # Categorize expenses based on description keywords
            categories = defaultdict(float)
            
            category_keywords = {
                'Food & Dining': ['restaurant', 'food', 'cafe', 'dining', 'eat', 'meal', 'pizza', 'chinese'],
                'Utilities': ['utility', 'bill', 'electric', 'water', 'gas', 'internet', 'phone'],
                'Transportation': ['fuel', 'gas', 'transport', 'taxi', 'uber', 'bus', 'car'],
                'ATM & Banking': ['atm', 'withdrawal', 'bank', 'fee', 'charge', 'transfer'],
                'Insurance': ['insurance', 'policy', 'premium'],
                'Shopping': ['mart', 'store', 'shop', 'purchase', 'buy'],
                'Loans & Payments': ['loan', 'payment', 'installment', 'emi'],
                'Other': []
            }
            
            for expense in expenses:
                description = expense.get('description', '').lower()
                amount = expense.get('amount', 0)
                categorized = False
                
                for category, keywords in category_keywords.items():
                    if category == 'Other':
                        continue
                    if any(keyword in description for keyword in keywords):
                        categories[category] += amount
                        categorized = True
                        break
                
                if not categorized:
                    categories['Other'] += amount
            
            # Remove categories with zero amounts
            categories = {k: v for k, v in categories.items() if v > 0}
            
            if not categories:
                return None
            
            # Create pie chart
            fig, ax = plt.subplots(figsize=(8, 8))
            
            labels = list(categories.keys())
            sizes = list(categories.values())
            colors = plt.cm.Set3(range(len(labels)))
            
            wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%', 
                                            colors=colors, startangle=90)
            
            ax.set_title('Expense Categories Breakdown', fontsize=14, fontweight='bold')
            
            # Add amount labels
            for i, (label, amount) in enumerate(categories.items()):
                texts[i].set_text(f'{label}\n({amount:,.0f})')
            
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
            img_buffer.seek(0)
            plt.close()
            
            return img_buffer
            
        except Exception as e:
            print(f"Error creating category chart: {e}")
            return None

    def create_transaction_table(self, transactions, title, max_rows=10):
        """Create a formatted transaction table"""
        if not transactions:
            return Paragraph(f"No {title.lower()} found", self.styles['Normal'])
        
        # Sort transactions by amount (descending)
        sorted_transactions = sorted(transactions, key=lambda x: x.get('amount', 0), reverse=True)
        
        # Take top transactions
        display_transactions = sorted_transactions[:max_rows]
        
        # Prepare table data
        table_data = [['Date', 'Description', 'Amount']]
        
        for transaction in display_transactions:
            date = transaction.get('date', 'N/A')
            description = transaction.get('description', 'N/A')
            amount = transaction.get('amount', 0)
            
            # Truncate long descriptions
            if len(description) > 40:
                description = description[:37] + '...'
            
            table_data.append([date, description, f"{amount:,.2f}"])
        
        # Add summary row if there are more transactions
        if len(transactions) > max_rows:
            remaining = len(transactions) - max_rows
            remaining_amount = sum([t.get('amount', 0) for t in sorted_transactions[max_rows:]])
            table_data.append(['...', f'+ {remaining} more transactions', f"{remaining_amount:,.2f}"])
        
        # Create table
        table = Table(table_data, colWidths=[1*inch, 3*inch, 1.5*inch])
        
        # Style the table
        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),  # Right align amounts
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]
        
        # Alternate row colors
        for i in range(1, len(table_data), 2):
            table_style.append(('BACKGROUND', (0, i), (-1, i), colors.lightgrey))
        
        table.setStyle(TableStyle(table_style))
        
        return table

    def create_insights_section(self, data):
        """Create financial insights section"""
        try:
            insights = []
            
            total_income = sum([t.get('amount', 0) for t in data.get('transactions', {}).get('income', [])])
            total_expenses = sum([t.get('amount', 0) for t in data.get('transactions', {}).get('expenses', [])])
            
            # Calculate insights
            if total_income > 0:
                expense_ratio = (total_expenses / total_income) * 100
                insights.append(f"• Expense Ratio: {expense_ratio:.1f}% of income")
                
                if expense_ratio > 80:
                    insights.append(f"• ⚠️ High expense ratio - consider reviewing spending")
                elif expense_ratio < 50:
                    insights.append(f"• ✅ Good expense ratio - healthy savings potential")
            
            # Analyze expense patterns
            expenses = data.get('transactions', {}).get('expenses', [])
            if expenses:
                avg_expense = total_expenses / len(expenses)
                insights.append(f"• Average expense per transaction: {avg_expense:,.2f}")
                
                # Find largest expense
                largest_expense = max(expenses, key=lambda x: x.get('amount', 0))
                insights.append(f"• Largest expense: {largest_expense.get('description', 'N/A')} ({largest_expense.get('amount', 0):,.2f})")
            
            # Analyze income patterns
            income_transactions = data.get('transactions', {}).get('income', [])
            if income_transactions:
                avg_income = total_income / len(income_transactions)
                insights.append(f"• Average income per transaction: {avg_income:,.2f}")
            
            # Transaction frequency
            total_transactions = len(expenses) + len(income_transactions)
            insights.append(f"• Total transactions: {total_transactions}")
            
            return insights
            
        except Exception as e:
            print(f"Error creating insights: {e}")
            return ["• Unable to generate insights"]

    def generate_pdf_report(self, data, output_path=None):
        """Generate comprehensive PDF report"""
        if output_path is None:
            output_path = "/tmp/bank_statement_report.pdf"
        
        try:
            # Create PDF document
            doc = SimpleDocTemplate(output_path, pagesize=A4, 
                                  rightMargin=72, leftMargin=72, 
                                  topMargin=72, bottomMargin=18)
            
            # Build story (content)
            story = []
            
            # Title
            title = Paragraph("Bank Statement Analysis Report", self.styles['CustomTitle'])
            story.append(title)
            story.append(Spacer(1, 20))
            
            # Account Summary Section
            story.append(Paragraph("Account Summary", self.styles['SectionHeader']))
            story.append(Spacer(1, 10))
            story.append(self.create_summary_cards(data))
            story.append(Spacer(1, 20))
            
            # Monthly Analysis Chart
            monthly_chart = self.create_monthly_chart(data)
            if monthly_chart:
                story.append(Paragraph("Monthly Income vs Expenses", self.styles['SectionHeader']))
                story.append(Spacer(1, 10))
                
                # Save chart image temporarily
                chart_path = "/tmp/monthly_chart.png"
                with open(chart_path, 'wb') as f:
                    f.write(monthly_chart.getvalue())
                
                chart_img = Image(chart_path, width=6*inch, height=3.6*inch)
                story.append(chart_img)
                story.append(Spacer(1, 20))
            
            # Expense Categories Chart
            category_chart = self.create_expense_category_chart(data)
            if category_chart:
                story.append(Paragraph("Expense Categories", self.styles['SectionHeader']))
                story.append(Spacer(1, 10))
                
                # Save chart image temporarily
                category_path = "/tmp/category_chart.png"
                with open(category_path, 'wb') as f:
                    f.write(category_chart.getvalue())
                
                category_img = Image(category_path, width=5*inch, height=5*inch)
                story.append(category_img)
                story.append(Spacer(1, 20))
            
            # Financial Insights
            insights = self.create_insights_section(data)
            story.append(Paragraph("Financial Insights", self.styles['SectionHeader']))
            story.append(Spacer(1, 10))
            
            insights_text = "<br/>".join(insights)
            insights_para = Paragraph(insights_text, self.styles['HighlightBox'])
            story.append(insights_para)
            story.append(Spacer(1, 20))
            
            # Top Income Transactions
            income_transactions = data.get('transactions', {}).get('income', [])
            if income_transactions:
                story.append(Paragraph("Top Income Transactions", self.styles['SectionHeader']))
                story.append(Spacer(1, 10))
                story.append(self.create_transaction_table(income_transactions, "Income"))
                story.append(Spacer(1, 20))
            
            # Top Expense Transactions
            expense_transactions = data.get('transactions', {}).get('expenses', [])
            if expense_transactions:
                story.append(Paragraph("Top Expense Transactions", self.styles['SectionHeader']))
                story.append(Spacer(1, 10))
                story.append(self.create_transaction_table(expense_transactions, "Expenses"))
                story.append(Spacer(1, 20))
            
            # Footer
            footer_text = f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            footer = Paragraph(footer_text, self.styles['Normal'])
            story.append(Spacer(1, 30))
            story.append(footer)
            
            # Build PDF
            doc.build(story)
            
            # Clean up temporary files
            for temp_file in ["/tmp/monthly_chart.png", "/tmp/category_chart.png"]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            
            return output_path
            
        except Exception as e:
            print(f"Error generating PDF report: {e}")
            raise e

# Helper function to use in your API
def generate_statement_report(extracted_data, filename=None):
    """
    Generate a PDF report from extracted bank statement data
    
    Args:
        extracted_data: Dictionary containing the extracted transaction data
        filename: Optional custom filename for the output PDF
        
    Returns:
        Path to the generated PDF file
    """
    generator = BankStatementPDFGenerator()
    
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"/tmp/bank_report_{timestamp}.pdf"
    
    return generator.generate_pdf_report(extracted_data, filename)
