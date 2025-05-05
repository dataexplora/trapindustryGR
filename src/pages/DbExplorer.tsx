import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface Table {
  name: string;
  rowCount: number;
  columns: Column[];
  sampleData: any[];
}

interface Column {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: string | null;
}

interface Relation {
  table: string;
  column: string;
  foreignTable: string;
  foreignColumn: string;
  name: string;
}

const DbExplorer = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exploreTables = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch the list of tables
        const { data: tableList, error: tableListError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .not('table_name', 'like', 'pg_%')
          .not('table_name', 'like', '_prisma_%');
        
        if (tableListError) {
          throw new Error(`Error fetching tables: ${tableListError.message}`);
        }
        
        if (!tableList || tableList.length === 0) {
          setTables([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch information for each table
        const tableData: Table[] = [];
        
        for (const table of tableList) {
          const tableName = table.table_name;
          
          // Get column information
          const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_schema', 'public')
            .eq('table_name', tableName);
          
          if (columnsError) {
            console.error(`Error fetching columns for ${tableName}:`, columnsError);
            continue;
          }

          // Get row count
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error(`Error counting rows for ${tableName}:`, countError);
            continue;
          }
          
          // Get sample data
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(5);
          
          if (sampleError) {
            console.error(`Error fetching sample data for ${tableName}:`, sampleError);
            continue;
          }
          
          tableData.push({
            name: tableName,
            rowCount: count || 0,
            columns: columns?.map(col => ({
              name: col.column_name,
              type: col.data_type,
              isNullable: col.is_nullable === 'YES',
              defaultValue: col.column_default
            })) || [],
            sampleData: sampleData || []
          });
        }
        
        setTables(tableData);
        
        // Fetch relationships (simplified - may not work in all Supabase projects)
        const { data: relationData, error: relationError } = await supabase
          .from('information_schema.key_column_usage')
          .select(`
            constraint_name,
            table_name,
            column_name,
            referenced_table_name:information_schema.referential_constraints!inner(referenced_table_name),
            referenced_column_name:information_schema.referential_constraints!inner(referenced_column_name)
          `)
          .eq('table_schema', 'public')
          .not('referenced_table_name', 'is', null);
        
        if (relationError) {
          console.error('Error fetching relations:', relationError);
        } else if (relationData) {
          setRelations(relationData.map(rel => ({
            table: rel.table_name,
            column: rel.column_name,
            foreignTable: rel.referenced_table_name?.referenced_table_name || '',
            foreignColumn: rel.referenced_column_name?.referenced_column_name || '',
            name: rel.constraint_name
          })));
        }
        
      } catch (err: any) {
        console.error('Error exploring database:', err);
        setError(err.message || 'An error occurred while exploring the database');
      } finally {
        setIsLoading(false);
      }
    };
    
    exploreTables();
  }, []);

  const countRelationsForTable = (tableName: string) => {
    return relations.filter(rel => 
      rel.table === tableName || rel.foreignTable === tableName
    ).length;
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Database className="mr-2 h-6 w-6 text-indigo-400" />
          <h1 className="text-3xl font-bold">Supabase Database Explorer</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl">Loading database structure...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">Tables</CardTitle>
                  <CardDescription>Database tables found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-500">{tables.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">Relations</CardTitle>
                  <CardDescription>Foreign key relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-500">{relations.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">Total Records</CardTitle>
                  <CardDescription>Combined row count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-500">
                    {tables.reduce((sum, table) => sum + table.rowCount, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="tables" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="tables">Tables</TabsTrigger>
                <TabsTrigger value="relations">Relations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tables">
                <div className="grid grid-cols-1 gap-6">
                  {tables.map(table => (
                    <Card key={table.name} className="overflow-hidden">
                      <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">{table.name}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded-md">
                              {table.rowCount} rows
                            </span>
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-md">
                              {countRelationsForTable(table.name)} relations
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="text-left p-3 font-medium">Column</th>
                                <th className="text-left p-3 font-medium">Type</th>
                                <th className="text-left p-3 font-medium">Nullable</th>
                                <th className="text-left p-3 font-medium">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map(column => (
                                <tr key={column.name} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                  <td className="p-3 font-medium">{column.name}</td>
                                  <td className="p-3">{column.type}</td>
                                  <td className="p-3">{column.isNullable ? 'Yes' : 'No'}</td>
                                  <td className="p-3 text-slate-500">{column.defaultValue || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {table.sampleData.length > 0 && (
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-slate-500 mb-2">Sample Data</h4>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3 overflow-x-auto">
                              <pre className="text-xs">{JSON.stringify(table.sampleData, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="relations">
                {relations.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                              <th className="text-left p-3 font-medium">Source Table</th>
                              <th className="text-left p-3 font-medium">Source Column</th>
                              <th className="text-left p-3 font-medium">Foreign Table</th>
                              <th className="text-left p-3 font-medium">Foreign Column</th>
                              <th className="text-left p-3 font-medium">Constraint</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relations.map((relation, index) => (
                              <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                <td className="p-3 font-medium">{relation.table}</td>
                                <td className="p-3">{relation.column}</td>
                                <td className="p-3 font-medium">{relation.foreignTable}</td>
                                <td className="p-3">{relation.foreignColumn}</td>
                                <td className="p-3 text-slate-500">{relation.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center p-10 bg-slate-50 dark:bg-slate-800/20 rounded-lg">
                    <p className="text-slate-500">No foreign key relationships detected</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DbExplorer; 