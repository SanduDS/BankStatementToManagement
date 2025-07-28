"""
CSV Export Service for Bank Statement Data
"""
import csv
import io
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class CSVExportService:
    """Service for exporting bank statement data to CSV format"""
    
    def __init__(self):
        self.csv_headers = {
            'transactions': ['Date', 'Type', 'Description', 'Amount', 'Running_Balance'],
            'summary': ['Metric', 'Value'],
            'monthly_summary': ['Month', 'Income', 'Expenses', 'Net_Amount'],
            'category_summary': ['Category', 'Amount', 'Transaction_Count', 'Percentage']
        }
    
    def export_all_data(self, extracted_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Export all bank statement data to multiple CSV formats
        
        Returns:
            Dictionary with CSV data for different export types
        """
        try:
            csv_data = {}
            
            # Export transactions
            csv_data['transactions'] = self.export_transactions(extracted_data)
            
            # Export account summary
            csv_data['summary'] = self.export_account_summary(extracted_data)
            
            # Export monthly breakdown
            csv_data['monthly_summary'] = self.export_monthly_summary(extracted_data)
            
            # Export category analysis
            csv_data['category_summary'] = self.export_category_summary(extracted_data)
            
            return csv_data
            
        except Exception as e:
            logger.error(f"Error exporting data to CSV: {str(e)}")
            raise e
    
    def export_transactions(self, extracted_data: Dict[str, Any]) -> str:
        """Export all transactions to CSV format"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(self.csv_headers['transactions'])
        
        # Combine and sort all transactions by date
        all_transactions = []
        
        # Add income transactions
        for transaction in extracted_data.get('transactions', {}).get('income', []):
            all_transactions.append({
                'date': transaction.get('date', ''),
                'type': 'Income',
                'description': transaction.get('description', ''),
                'amount': transaction.get('amount', 0)
            })
        
        # Add expense transactions (as negative amounts)
        for transaction in extracted_data.get('transactions', {}).get('expenses', []):
            all_transactions.append({
                'date': transaction.get('date', ''),
                'type': 'Expense',
                'description': transaction.get('description', ''),
                'amount': -transaction.get('amount', 0)  # Negative for expenses
            })
        
        # Sort by date
        all_transactions.sort(key=lambda x: self._parse_date_for_sorting(x['date']))
        
        # Calculate running balance
        running_balance = extracted_data.get('final_balance', 0)
        
        # Work backwards to calculate initial balance
        total_net = sum(t['amount'] for t in all_transactions)
        initial_balance = running_balance - total_net
        current_balance = initial_balance
        
        # Write transaction rows
        for transaction in all_transactions:
            current_balance += transaction['amount']
            writer.writerow([
                transaction['date'],
                transaction['type'],
                transaction['description'],
                abs(transaction['amount']),  # Always positive in CSV
                f"{current_balance:.2f}"
            ])
        
        return output.getvalue()
    
    def export_account_summary(self, extracted_data: Dict[str, Any]) -> str:
        """Export account summary to CSV format"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(self.csv_headers['summary'])
        
        # Calculate summary metrics
        account_details = extracted_data.get('account_details', {})
        transactions = extracted_data.get('transactions', {})
        
        total_income = sum(t.get('amount', 0) for t in transactions.get('income', []))
        total_expenses = sum(t.get('amount', 0) for t in transactions.get('expenses', []))
        net_amount = total_income - total_expenses
        
        # Write summary rows
        summary_data = [
            ['Account Holder', account_details.get('name', 'N/A')],
            ['Account Number', account_details.get('account_number', 'N/A')],
            ['Currency', account_details.get('currency', 'N/A')],
            ['Statement Period', account_details.get('statement_date', 'N/A')],
            ['Total Income', f"{total_income:.2f}"],
            ['Total Expenses', f"{total_expenses:.2f}"],
            ['Net Amount', f"{net_amount:.2f}"],
            ['Final Balance', f"{extracted_data.get('final_balance', 0):.2f}"],
            ['Number of Income Transactions', str(len(transactions.get('income', [])))],
            ['Number of Expense Transactions', str(len(transactions.get('expenses', [])))],
            ['Export Date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')]
        ]
        
        for row in summary_data:
            writer.writerow(row)
        
        return output.getvalue()
    
    def export_monthly_summary(self, extracted_data: Dict[str, Any]) -> str:
        """Export monthly breakdown to CSV format"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(self.csv_headers['monthly_summary'])
        
        # Calculate monthly data
        monthly_data = {}
        
        # Process income
        for transaction in extracted_data.get('transactions', {}).get('income', []):
            month = self._extract_month_year(transaction.get('date', ''))
            if month:
                if month not in monthly_data:
                    monthly_data[month] = {'income': 0, 'expenses': 0}
                monthly_data[month]['income'] += transaction.get('amount', 0)
        
        # Process expenses
        for transaction in extracted_data.get('transactions', {}).get('expenses', []):
            month = self._extract_month_year(transaction.get('date', ''))
            if month:
                if month not in monthly_data:
                    monthly_data[month] = {'income': 0, 'expenses': 0}
                monthly_data[month]['expenses'] += transaction.get('amount', 0)
        
        # Sort months and write data
        for month in sorted(monthly_data.keys()):
            data = monthly_data[month]
            net_amount = data['income'] - data['expenses']
            writer.writerow([
                month,
                f"{data['income']:.2f}",
                f"{data['expenses']:.2f}",
                f"{net_amount:.2f}"
            ])
        
        return output.getvalue()
    
    def export_category_summary(self, extracted_data: Dict[str, Any]) -> str:
        """Export expense category analysis to CSV format"""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(self.csv_headers['category_summary'])
        
        # Categorize expenses
        categories = self._categorize_expenses(extracted_data.get('transactions', {}).get('expenses', []))
        total_expenses = sum(categories.values())
        
        # Write category data
        for category, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            percentage = (amount / total_expenses * 100) if total_expenses > 0 else 0
            # Count transactions in this category
            transaction_count = self._count_transactions_in_category(
                extracted_data.get('transactions', {}).get('expenses', []), 
                category
            )
            
            writer.writerow([
                category,
                f"{amount:.2f}",
                str(transaction_count),
                f"{percentage:.1f}%"
            ])
        
        return output.getvalue()
    
    def _parse_date_for_sorting(self, date_str: str) -> datetime:
        """Parse date string for sorting purposes"""
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
            
            # Handle other common formats
            for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%m/%d/%Y']:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
        except:
            pass
        
        # Return a default date if parsing fails
        return datetime(1900, 1, 1)
    
    def _extract_month_year(self, date_str: str) -> Optional[str]:
        """Extract month-year string from date"""
        try:
            parsed_date = self._parse_date_for_sorting(date_str)
            if parsed_date.year > 1900:  # Valid date
                return parsed_date.strftime('%Y-%m')
        except:
            pass
        return None
    
    def _categorize_expenses(self, expenses: List[Dict]) -> Dict[str, float]:
        """Categorize expenses based on description keywords"""
        categories = {
            'Food & Dining': 0,
            'Transportation': 0,
            'Utilities': 0,
            'Healthcare': 0,
            'Shopping': 0,
            'Entertainment': 0,
            'Banking & Finance': 0,
            'Bills & Payments': 0,
            'Others': 0
        }
        
        category_keywords = {
            'Food & Dining': ['restaurant', 'food', 'meal', 'dining', 'coffee', 'pizza', 'burger', 'cafe'],
            'Transportation': ['fuel', 'gas', 'taxi', 'uber', 'lyft', 'bus', 'train', 'parking', 'toll'],
            'Utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
            'Healthcare': ['hospital', 'doctor', 'medical', 'pharmacy', 'health', 'clinic'],
            'Shopping': ['store', 'shop', 'market', 'supermarket', 'retail', 'purchase'],
            'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'ticket', 'concert'],
            'Banking & Finance': ['bank', 'fee', 'charge', 'interest', 'loan', 'atm', 'withdrawal'],
            'Bills & Payments': ['payment', 'bill', 'invoice', 'subscription', 'insurance', 'premium']
        }
        
        for expense in expenses:
            description = expense.get('description', '').lower()
            amount = expense.get('amount', 0)
            categorized = False
            
            for category, keywords in category_keywords.items():
                if any(keyword in description for keyword in keywords):
                    categories[category] += amount
                    categorized = True
                    break
            
            if not categorized:
                categories['Others'] += amount
        
        return categories
    
    def _count_transactions_in_category(self, expenses: List[Dict], target_category: str) -> int:
        """Count transactions in a specific category"""
        category_keywords = {
            'Food & Dining': ['restaurant', 'food', 'meal', 'dining', 'coffee', 'pizza', 'burger', 'cafe'],
            'Transportation': ['fuel', 'gas', 'taxi', 'uber', 'lyft', 'bus', 'train', 'parking', 'toll'],
            'Utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
            'Healthcare': ['hospital', 'doctor', 'medical', 'pharmacy', 'health', 'clinic'],
            'Shopping': ['store', 'shop', 'market', 'supermarket', 'retail', 'purchase'],
            'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'ticket', 'concert'],
            'Banking & Finance': ['bank', 'fee', 'charge', 'interest', 'loan', 'atm', 'withdrawal'],
            'Bills & Payments': ['payment', 'bill', 'invoice', 'subscription', 'insurance', 'premium']
        }
        
        if target_category not in category_keywords:
            # Count "Others" category
            count = 0
            for expense in expenses:
                description = expense.get('description', '').lower()
                categorized = False
                
                for keywords in category_keywords.values():
                    if any(keyword in description for keyword in keywords):
                        categorized = True
                        break
                
                if not categorized:
                    count += 1
            return count
        
        keywords = category_keywords[target_category]
        count = 0
        for expense in expenses:
            description = expense.get('description', '').lower()
            if any(keyword in description for keyword in keywords):
                count += 1
        
        return count
